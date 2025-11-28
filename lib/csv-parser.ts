export type CSVRow = {
  date_start: string
  date_end: string
  ad_name: string
  campaign_name: string
  adset_name: string
  impressions: number
  clicks: number
  spend: number
  purchases: number
  revenue: number
}

const COLUMN_MAP: Record<string, string> = {
  'reporting starts': 'date_start',
  'reporting ends': 'date_end',
  'ad name': 'ad_name',
  'campaign name': 'campaign_name',
  'ad set name': 'adset_name',
  'impressions': 'impressions',
  'link clicks': 'clicks',
  'amount spent (usd)': 'spend',
  'direct website purchases': 'purchases',
  'direct website purchases conversion value': 'revenue',
}

export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase())
  
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    
    const row: any = {}
    
    headers.forEach((header, index) => {
      const mappedKey = COLUMN_MAP[header]
      if (mappedKey && values[index] !== undefined) {
        const value = values[index].trim()
        
        if (['impressions', 'clicks', 'spend', 'purchases', 'revenue'].includes(mappedKey)) {
          row[mappedKey] = parseFloat(value.replace(/[,$]/g, '')) || 0
        } else {
          row[mappedKey] = value
        }
      }
    })

    if (row.campaign_name && row.ad_name) {
      rows.push({
        date_start: row.date_start || '',
        date_end: row.date_end || '',
        ad_name: row.ad_name || '',
        campaign_name: row.campaign_name || '',
        adset_name: row.adset_name || '',
        impressions: row.impressions || 0,
        clicks: row.clicks || 0,
        spend: row.spend || 0,
        purchases: row.purchases || 0,
        revenue: row.revenue || 0,
      })
    }
  }

  return rows
}

export function generateSampleCSV(): string {
  const headers = 'Reporting starts\tReporting ends\tAd name\tCampaign name\tAd set name\tImpressions\tLink clicks\tAmount spent (USD)\tDirect website purchases\tDirect website purchases conversion value'
  const rows = [
    '2024-01-15\t2024-01-21\tVideo - Summer Vibes\tSummer Sale 2024\tLookalike 1%\t45000\t1100\t750\t18\t3400',
    '2024-01-15\t2024-01-21\tCarousel - Products\tSummer Sale 2024\tLookalike 1%\t40000\t800\t650\t10\t1800',
    '2024-01-15\t2024-01-21\tStatic - Hero Image\tSummer Sale 2024\tInterest - Fashion\t35000\t720\t580\t8\t1400',
  ]
  return [headers, ...rows].join('\n')
}
