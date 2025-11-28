import Papa from 'papaparse'

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

// Expected column headers (case-insensitive matching)
const COLUMN_MAP: Record<string, keyof CSVRow> = {
  'start date': 'date_start',
  'date start': 'date_start',
  'start_date': 'date_start',
  'end date': 'date_end',
  'date end': 'date_end',
  'end_date': 'date_end',
  'ad name': 'ad_name',
  'ad_name': 'ad_name',
  'campaign name': 'campaign_name',
  'campaign_name': 'campaign_name',
  'ad set name': 'adset_name',
  'adset name': 'adset_name',
  'adset_name': 'adset_name',
  'ad_set_name': 'adset_name',
  'impressions': 'impressions',
  'link clicks': 'clicks',
  'clicks': 'clicks',
  'clicks (all)': 'clicks',
  'amount spent': 'spend',
  'spend': 'spend',
  'amount_spent': 'spend',
  'purchases': 'purchases',
  'direct website purchases': 'purchases',
  'website purchases': 'purchases',
  'purchase value': 'revenue',
  'revenue': 'revenue',
  'purchase_value': 'revenue',
  'direct website purchases conversion value': 'revenue',
  'website purchase conversion value': 'revenue',
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim()
}

function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0
  // Remove currency symbols and commas
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseDate(value: any): string {
  if (!value) return new Date().toISOString().split('T')[0]
  
  // Try to parse various date formats
  const dateStr = String(value).trim()
  
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Try MM/DD/YYYY or M/D/YYYY
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Try parsing with Date
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  
  return new Date().toISOString().split('T')[0]
}

export function parseCSV(file: File): Promise<{ rows: CSVRow[], errors: string[] }> {
  return new Promise((resolve, reject) => {
    const errors: string[] = []
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV'))
          return
        }
        
        // Map headers to our expected columns
        const headers = results.meta.fields || []
        const headerMap: Record<string, keyof CSVRow> = {}
        
        headers.forEach((header) => {
          const normalized = normalizeHeader(header)
          if (COLUMN_MAP[normalized]) {
            headerMap[header] = COLUMN_MAP[normalized]
          }
        })
        
        // Check for required columns
        const requiredColumns: (keyof CSVRow)[] = [
          'ad_name', 'campaign_name', 'adset_name', 'spend'
        ]
        const mappedColumns = Object.values(headerMap)
        const missingColumns = requiredColumns.filter(col => !mappedColumns.includes(col))
        
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
        }
        
        // Parse rows
        const rows: CSVRow[] = []
        
        results.data.forEach((rawRow: any, index: number) => {
          try {
            const row: Partial<CSVRow> = {}
            
            Object.entries(headerMap).forEach(([originalHeader, mappedKey]) => {
              const value = rawRow[originalHeader]
              
              if (mappedKey === 'date_start' || mappedKey === 'date_end') {
                row[mappedKey] = parseDate(value)
              } else if (['impressions', 'clicks', 'spend', 'purchases', 'revenue'].includes(mappedKey)) {
                row[mappedKey as 'impressions' | 'clicks' | 'spend' | 'purchases' | 'revenue'] = parseNumber(value)
              } else {
                row[mappedKey as 'ad_name' | 'campaign_name' | 'adset_name'] = String(value || '').trim()
              }
            })
            
            // Set defaults for missing date columns
            if (!row.date_start) row.date_start = new Date().toISOString().split('T')[0]
            if (!row.date_end) row.date_end = row.date_start
            
            // Only add rows with required data
            if (row.ad_name && row.campaign_name && row.adset_name) {
              rows.push(row as CSVRow)
            } else {
              errors.push(`Row ${index + 2}: Missing required fields`)
            }
          } catch (e) {
            errors.push(`Row ${index + 2}: Parse error`)
          }
        })
        
        resolve({ rows, errors })
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`))
      }
    })
  })
}

// Generate sample CSV for download
export function generateSampleCSV(): string {
  const headers = [
    'Start Date',
    'End Date', 
    'Ad Name',
    'Campaign Name',
    'Ad Set Name',
    'Impressions',
    'Link Clicks',
    'Amount Spent',
    'Purchases',
    'Purchase Value'
  ]
  
  const sampleData = [
    ['2024-01-01', '2024-01-07', 'Video - Summer Vibes', 'Summer Sale 2024', 'Lookalike 1%', '45000', '1100', '750', '18', '3400'],
    ['2024-01-01', '2024-01-07', 'Carousel - Products', 'Summer Sale 2024', 'Lookalike 1%', '40000', '800', '650', '10', '1800'],
    ['2024-01-01', '2024-01-07', 'Static - Hero Image', 'Summer Sale 2024', 'Interest - Fashion', '35000', '720', '580', '8', '1400'],
    ['2024-01-01', '2024-01-07', 'UGC Review', 'Summer Sale 2024', 'Interest - Fashion', '30000', '680', '520', '9', '1900'],
    ['2024-01-01', '2024-01-07', 'Brand Story Video', 'Brand Awareness Q4', 'Broad - US', '120000', '1200', '1100', '6', '950'],
    ['2024-01-01', '2024-01-07', 'Product Demo', 'Brand Awareness Q4', 'Broad - US', '80000', '600', '700', '6', '1150'],
  ]
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n')
  
  return csvContent
}
