'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { parseCSV, generateSampleCSV, CSVRow } from '@/lib/csv-parser'
import { cn } from '@/lib/utils'

type CSVUploadProps = {
  onUpload: (rows: CSVRow[]) => void
  isLoading?: boolean
}

export function CSVUpload({ onUpload, isLoading }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(null)
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    
    try {
      const { rows, errors } = await parseCSV(file)
      
      if (errors.length > 0) {
        console.warn('CSV parse warnings:', errors)
      }
      
      if (rows.length === 0) {
        setError('No valid data found in CSV')
        return
      }
      
      setSuccess(`Successfully parsed ${rows.length} rows`)
      onUpload(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV')
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }
  
  const downloadSample = () => {
    const csv = generateSampleCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'adnest-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging 
            ? 'border-accent bg-accent/5' 
            : 'border-border hover:border-border-light hover:bg-bg-hover',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Upload className={cn(
          'w-10 h-10 mx-auto mb-3',
          isDragging ? 'text-accent' : 'text-zinc-500'
        )} />
        
        <p className="text-sm font-medium mb-1">
          {isDragging ? 'Drop your CSV here' : 'Drop CSV or click to upload'}
        </p>
        <p className="text-xs text-zinc-500">
          Export from Meta Ads Manager at Ad level
        </p>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-verdict-cut bg-verdict-cut-bg border border-verdict-cut/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-sm text-verdict-scale bg-verdict-scale-bg border border-verdict-scale/20 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      
      {/* Sample Download */}
      <button
        onClick={downloadSample}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <Download className="w-4 h-4" />
        Download sample CSV
      </button>
      
      {/* Column Format Help */}
      <div className="bg-bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-3">
          <FileText className="w-4 h-4 text-accent" />
          Expected CSV Columns
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div>• Start Date</div>
          <div>• End Date</div>
          <div>• Ad Name</div>
          <div>• Campaign Name</div>
          <div>• Ad Set Name</div>
          <div>• Impressions</div>
          <div>• Link Clicks</div>
          <div>• Amount Spent</div>
          <div>• Purchases</div>
          <div>• Purchase Value</div>
        </div>
      </div>
    </div>
  )
}
