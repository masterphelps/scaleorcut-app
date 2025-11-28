'use client'

import { useState } from 'react'
import { Upload, Calendar, Lock } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { PerformanceTable } from '@/components/performance-table'
import { CSVUpload } from '@/components/csv-upload'
import { CSVRow } from '@/lib/csv-parser'
import { Rules } from '@/lib/supabase'
import { formatCurrency, formatNumber, formatROAS, formatDateRange } from '@/lib/utils'
import { useSubscription } from '@/lib/subscription'
import Link from 'next/link'

const FREE_CAMPAIGN_LIMIT = 5

const DEFAULT_RULES: Rules = {
  id: '',
  ad_account_id: '',
  scale_roas: 3.0,
  min_roas: 1.5,
  learning_spend: 100,
  created_at: '',
  updated_at: ''
}

const SAMPLE_DATA: CSVRow[] = [
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Video - Summer Vibes', campaign_name: 'Summer Sale 2024', adset_name: 'Lookalike 1%', impressions: 45000, clicks: 1100, spend: 750, purchases: 18, revenue: 3400 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Carousel - Products', campaign_name: 'Summer Sale 2024', adset_name: 'Lookalike 1%', impressions: 40000, clicks: 800, spend: 650, purchases: 10, revenue: 1800 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Static - Hero Image', campaign_name: 'Summer Sale 2024', adset_name: 'Interest - Fashion', impressions: 35000, clicks: 720, spend: 580, purchases: 8, revenue: 1400 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'UGC Review', campaign_name: 'Summer Sale 2024', adset_name: 'Interest - Fashion', impressions: 30000, clicks: 680, spend: 520, purchases: 9, revenue: 1900 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Brand Story Video', campaign_name: 'Brand Awareness Q4', adset_name: 'Broad - US', impressions: 120000, clicks: 1200, spend: 1100, purchases: 6, revenue: 950 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Product Demo', campaign_name: 'Brand Awareness Q4', adset_name: 'Broad - US', impressions: 80000, clicks: 600, spend: 700, purchases: 6, revenue: 1150 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Retargeting - Cart', campaign_name: 'Retargeting', adset_name: 'Cart Abandoners', impressions: 15000, clicks: 450, spend: 280, purchases: 12, revenue: 2800 },
  { date_start: '2024-01-15', date_end: '2024-01-21', ad_name: 'Retargeting - Viewed', campaign_name: 'Retargeting', adset_name: 'Product Viewers', impressions: 25000, clicks: 380, spend: 320, purchases: 8, revenue: 1600 },
]

export default function DashboardPage() {
  const [data, setData] = useState<CSVRow[]>(SAMPLE_DATA)
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES)
  const [showUpload, setShowUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { plan } = useSubscription()
  
  const userPlan = plan
  
  const allCampaigns = Array.from(new Set(data.map(row => row.campaign_name)))
  const totalCampaigns = allCampaigns.length
  const isLimited = userPlan === 'Free' && totalCampaigns > FREE_CAMPAIGN_LIMIT
  const hiddenCampaigns = isLimited ? totalCampaigns - FREE_CAMPAIGN_LIMIT : 0
  
  const visibleCampaigns = userPlan === 'Free' 
    ? allCampaigns.slice(0, FREE_CAMPAIGN_LIMIT)
    : allCampaigns
  
  const filteredData = data.filter(row => visibleCampaigns.includes(row.campaign_name))
  
  const totals = {
    spend: filteredData.reduce((sum, row) => sum + row.spend, 0),
    revenue: filteredData.reduce((sum, row) => sum + row.revenue, 0),
    purchases: filteredData.reduce((sum, row) => sum + row.purchases, 0),
    impressions: filteredData.reduce((sum, row) => sum + row.impressions, 0),
    roas: 0
  }
  totals.roas = totals.spend > 0 ? totals.revenue / totals.spend : 0
  
  const dateRange = {
    start: data.length > 0 ? data[0].date_start : new Date().toISOString().split('T')[0],
    end: data.length > 0 ? data[0].date_end : new Date().toISOString().split('T')[0]
  }
  
  const handleUpload = (rows: CSVRow[]) => {
    setData(rows)
    setShowUpload(false)
  }
  
  const tableData = filteredData.map(row => ({
    campaign_name: row.campaign_name,
    adset_name: row.adset_name,
    ad_name: row.ad_name,
    impressions: row.impressions,
    clicks: row.clicks,
    spend: row.spend,
    purchases: row.purchases,
    revenue: row.revenue,
    roas: row.spend > 0 ? row.revenue / row.spend : 0
  }))
  
  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-zinc-500">Your Meta Ads performance at a glance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 bg-verdict-scale rounded-full" />
            Updated just now
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border rounded-lg text-sm hover:border-border-light transition-colors">
            <Calendar className="w-4 h-4" />
            {formatDateRange(dateRange.start, dateRange.end)}
          </button>
          
          <button 
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
        </div>
      </div>
      
      {isLimited && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500" />
            <div>
              <div className="font-medium text-amber-500">
                {hiddenCampaigns} campaign{hiddenCampaigns > 1 ? 's' : ''} hidden
              </div>
              <div className="text-sm text-zinc-400">
                Free plan is limited to {FREE_CAMPAIGN_LIMIT} campaigns. Upgrade to see all your data.
              </div>
            </div>
          </div>
          <Link 
            href="/pricing"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Spend" 
          value={formatCurrency(totals.spend)}
          icon="💰"
          change={{ value: 12.3, isPositive: true }}
        />
        <StatCard 
          label="Revenue" 
          value={formatCurrency(totals.revenue)}
          icon="💵"
          change={{ value: 23.1, isPositive: true }}
        />
        <StatCard 
          label="ROAS" 
          value={formatROAS(totals.roas)}
          icon="📈"
          change={{ value: 8.5, isPositive: true }}
        />
        <StatCard 
          label="Purchases" 
          value={formatNumber(totals.purchases)}
          icon="🛒"
          change={{ value: 3.2, isPositive: false }}
        />
      </div>
      
      <PerformanceTable 
        data={tableData}
        rules={rules}
        dateRange={dateRange}
      />
      
      {showUpload && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowUpload(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-sidebar border border-border rounded-xl p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Upload CSV</h2>
              <button 
                onClick={() => setShowUpload(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-card border border-border text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <CSVUpload onUpload={handleUpload} isLoading={isLoading} />
          </div>
        </>
      )}
    </>
  )
}
