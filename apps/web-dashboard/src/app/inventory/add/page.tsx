'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Shell from '@/components/layout/Shell'
import { apiClient } from '@/lib/axios'
import { Upload, Image as ImageIcon, FileText, Loader2, CheckCircle, XCircle, ReceiptText, CalendarClock, Store, ShoppingCart, Facebook, MessageCircle, Box, MoreHorizontal, Banknote, Wallet, ArrowRightLeft, CreditCard, Smartphone, RefreshCcw } from 'lucide-react'

type Status = 'idle' | 'uploading' | 'processing' | 'review' | 'saving' | 'success'
type UploadMode = 'single_image' | 'multiple_images' | 'written_file'

import { PAYMENT_METHODS as CENTRAL_PAYMENT_METHODS, TRANSACTION_CHANNELS as CENTRAL_CHANNELS } from '@/constants/transactionOptions'

const BUY_CHANNELS = CENTRAL_CHANNELS.map((c) => ({
  key: c.key,
  icon: Store,
  color: "text-zinc-300",
  bg: "bg-[#141414]",
  border: "border-[#252525]",
  label: c.label,
}));

const PAYMENT_METHODS = CENTRAL_PAYMENT_METHODS.map((m) => ({
  key: m.key,
  icon: Banknote,
  color: "text-zinc-300",
  bg: "bg-[#141414]",
  border: "border-[#252525]",
  label: m.label,
}));

import { Suspense } from 'react'

export default function BulkAddPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <BulkAddPage />
    </Suspense>
  )
}

function BulkAddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBatchId = searchParams.get('batchId')
  
  const [status, setStatus] = useState<Status>(initialBatchId ? 'processing' : 'idle')
  const [uploadMode, setUploadMode] = useState<UploadMode>('single_image')
  const [batchId, setBatchId] = useState<string | null>(initialBatchId)
  const [cards, setCards] = useState<any[]>([])
  const [pricing, setPricing] = useState<Record<string, { condition: string, paidPrice: string, askPrice: string, channel: string, paymentMethod: string, sport: string }>>({})
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [expandedComps, setExpandedComps] = useState<Record<string, boolean>>({})
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'processing' && batchId) {
      interval = setInterval(async () => {
        try {
          const { data } = await apiClient.get(`/batch/jobs/${batchId}`)
          if (data.status === 'completed') {
            const results = data.resultsJson || []
            setCards(results)
            
            // Auto-fill paidPrice from Gemini extraction if available
            const initialPricing: Record<string, any> = {}
            results.forEach((card: any) => {
              initialPricing[card.id] = {
                condition: card.gradeKey === 'RAW' ? 'Mint' : 'Graded',
                paidPrice: card.purchase_price ? String(card.purchase_price) : '',
                askPrice: '',
                channel: 'other',
                paymentMethod: 'other',
                sport: card.sport || 'Unknown'
              }
            })
            setPricing(initialPricing)
            setSelectedCards(new Set(results.map((c: any) => c.id)))
            
            setStatus('review')
          } else if (data.status === 'failed') {
            setErrorMsg(`Processing failed: ${data.error}`)
            setStatus('idle')
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Error polling job status')
          setStatus('idle')
        }
      }, 2500)
    }
    return () => clearInterval(interval)
  }, [status, batchId])

  const compressImageFile = (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
        return
      }
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let width = img.width
        let height = img.height
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files || files.length === 0) return

      setStatus('uploading')

      if (uploadMode === 'written_file') {
        const text = await files[0].text()
        await apiClient.post('/batch/upload', { rawText: text })
        router.push('/tasks?toast=RSL+agent+is+started+task+in+background')
      } else if (uploadMode === 'multiple_images') {
        const promises = Array.from(files).map(async (file) => {
          const base64 = await compressImageFile(file)
          await apiClient.post('/batch/scan-multi', { image: base64 })
        })
        await Promise.all(promises)
        router.push('/tasks?toast=RSL+agent+is+started+task+in+background')
      } else {
        // single_image
        const base64 = await compressImageFile(files[0])
        await apiClient.post('/batch/scan-multi', { image: base64 })
        router.push('/tasks?toast=RSL+agent+is+started+task+in+background')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed')
      setStatus('idle')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event
      const event = { target: { files: e.dataTransfer.files } } as any
      handleFileChange(event)
    }
  }

  const updatePricing = (id: string, field: 'condition' | 'paidPrice' | 'askPrice' | 'channel' | 'paymentMethod' | 'sport', value: string) => {
    setPricing(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { condition: 'Mint', paidPrice: '', askPrice: '', channel: 'other', paymentMethod: 'other', sport: '' }),
        [field]: value
      }
    }))
  }

  const toggleComps = (id: string) => {
    setExpandedComps(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSave = async () => {
    if (status === 'saving') return;
    const cardsToSave = cards.filter(c => selectedCards.has(c.id))
    if (cardsToSave.length === 0) {
      setErrorMsg("Please select at least one card to save.")
      return
    }

    setStatus('saving')
    try {
      for (const card of cardsToSave) {
        const p = pricing[card.id]
        const payload = {
          playerName: card.player_name,
          year: card.year,
          setName: card.set_name,
          variation: card.variation,
          cardNumber: card.card_number,
          sport: p?.sport || card.sport,
          gradeCompany: card.grading?.company,
          gradeValue: card.grading?.grade,
          gradeKey: card.gradeKey || (card.grading?.company && card.grading?.grade ? `${card.grading.company} ${card.grading.grade}` : 'RAW'),
          certNumber: card.grading?.cert_number,
          costBasis: parseFloat(p?.paidPrice || "0"),
          currentMarketValue: parseFloat(p?.askPrice || "0"),
          comps: card.comps,
          uploadedImageUrl: card.uploadedImageUrl,
        }
        const res = await apiClient.post('/v1/inventory', payload)
        
        // Always create a buy transaction, default to 'other' if not selected
        const inventoryId = res.data?.item?.id
        if (inventoryId) {
          await apiClient.post('/v1/transactions/buy', {
            inventoryId,
            playerId: card.player_id,
            playerName: card.player_name || "Unknown Card",
            price: p?.paidPrice || "0",
            costBasis: p?.paidPrice || "0",
            channel: p?.channel || "other",
            paymentMethod: p?.paymentMethod || "other",
            gradeKey: card.gradeKey || 'RAW',
            cardSnapshot: JSON.stringify(card),
          })
        }
      }
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving cards')
      setStatus('review')
    }
  }

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Add Cards</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Upload images or text lists to automatically extract cards and fetch comps.
            </p>
          </div>
          {(status === 'review' || status === 'saving' || status === 'success') && (
            <button
              onClick={() => { setStatus('idle'); setCards([]); setPricing({}); setBatchId(null); }}
              className="text-sm text-[#E8001C] hover:text-red-400 font-medium"
            >
              Start New Upload
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {(status === 'idle' || status === 'uploading' || status === 'processing') && (
          <div 
            className="border-2 border-dashed border-[#252525] bg-[#0D0D0D] rounded-2xl p-12 text-center hover:bg-[#141414] transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => status === 'idle' && fileInputRef.current?.click()}
          >
            {status === 'idle' && (
              <div className="mb-8 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <nav className="-mb-px flex space-x-8 border-b border-[#252525]" aria-label="Tabs">
                  <button
                    onClick={() => setUploadMode('single_image')}
                    className={`${uploadMode === 'single_image' ? 'border-[#E8001C] text-[#E8001C]' : 'border-transparent text-zinc-400 hover:text-white hover:border-[#333]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Single Image
                  </button>
                  <button
                    onClick={() => setUploadMode('multiple_images')}
                    className={`${uploadMode === 'multiple_images' ? 'border-[#E8001C] text-[#E8001C]' : 'border-transparent text-zinc-400 hover:text-white hover:border-[#333]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Multiple Images
                  </button>
                  <button
                    onClick={() => setUploadMode('written_file')}
                    className={`${uploadMode === 'written_file' ? 'border-[#E8001C] text-[#E8001C]' : 'border-transparent text-zinc-400 hover:text-white hover:border-[#333]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Written File
                  </button>
                </nav>
              </div>
            )}

            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              multiple={uploadMode === 'multiple_images'}
              accept={uploadMode === 'written_file' ? '.csv,.txt' : 'image/*'}
            />

            {status === 'idle' && (
              <div className="flex flex-col items-center">
                <div className="flex gap-4 mb-4">
                  {uploadMode === 'written_file' ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileText className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E8001C]/15 border border-[#E8001C]/30 flex items-center justify-center text-[#E8001C]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {uploadMode === 'single_image' && 'Upload a Single Image'}
                  {uploadMode === 'multiple_images' && 'Upload Multiple Images'}
                  {uploadMode === 'written_file' && 'Upload a Written File'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md">
                  {uploadMode === 'single_image' && 'Drag and drop a single large image containing multiple cards.'}
                  {uploadMode === 'multiple_images' && 'Select and upload multiple individual card images at once.'}
                  {uploadMode === 'written_file' && 'Upload a CSV/TXT file with written card details to extract.'}
                </p>
                <div className="mt-6 px-4 py-2 bg-[#141414] border border-[#252525] rounded-lg shadow-sm text-sm font-medium text-white">
                  Select {uploadMode === 'multiple_images' ? 'Files' : 'File'}
                </div>
              </div>
            )}

            {(status === 'uploading' || status === 'processing') && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-10 h-10 text-[#E8001C] animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">
                  {status === 'uploading' ? 'Uploading...' : 'RSL is extracting data & fetching comps...'}
                </h3>
                <p className="text-sm text-zinc-400">This may take up to 20 seconds depending on the file size.</p>
              </div>
            )}
          </div>
        )}

        {status === 'review' && (
          <div className="bg-[#0D0D0D] border border-[#252525] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#252525] flex justify-between items-center bg-[#141414]">
              <h3 className="text-lg font-semibold text-white">
                Review {cards.length} Extracted Cards ({selectedCards.size} selected)
              </h3>
              <button
                onClick={handleSave}
                className="bg-[#E8001C] hover:bg-[#CC0018] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
              >
                Confirm & Save to Inventory
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0D0D0D] border-b border-[#252525] text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-[#E8001C] rounded cursor-pointer"
                        checked={cards.length > 0 && selectedCards.size === cards.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCards(new Set(cards.map(c => c.id)))
                          } else {
                            setSelectedCards(new Set())
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-4">Card Info</th>
                    <th className="px-6 py-4">Market Analytics</th>
                    <th className="px-6 py-4">Your Pricing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                  {cards.map((card) => {
                    const cPricing = pricing[card.id] || { condition: 'Mint', paidPrice: '', askPrice: '', channel: 'other', paymentMethod: 'other' }
                    const avgSold = card.comps?.snapshots?.[0]?.avgSoldPrice || "0.00"
                    const lowestActive = card.comps?.snapshots?.[0]?.lowestActive || "0.00"
                    const isSelected = selectedCards.has(card.id)
                    
                    return (
                      <React.Fragment key={card.id}>
                        <tr className={`hover:bg-[#141414] transition-colors ${isSelected ? '' : 'opacity-40 grayscale-[0.3]'}`}>
                          <td className="px-6 py-4 align-top">
                            <input 
                              type="checkbox"
                              className="w-4 h-4 accent-[#E8001C] rounded cursor-pointer mt-1"
                              checked={isSelected}
                              onChange={(e) => {
                                const newSet = new Set(selectedCards)
                                if (e.target.checked) newSet.add(card.id)
                                else newSet.delete(card.id)
                                setSelectedCards(newSet)
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 align-top">
                          <div className="font-bold text-white text-base mb-1">
                            {card.year} {card.set_name} {card.player_name}
                          </div>
                          <div className="text-zinc-400 flex items-center gap-2">
                            <span className="bg-[#141414] px-2 py-0.5 rounded text-xs font-medium border border-[#252525]">
                              {card.variation || 'Base'}
                            </span>
                            {card.gradeKey && card.gradeKey !== "RAW" && (
                              <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-medium">
                                {card.gradeKey}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex gap-6">
                            <div>
                              <div className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wide">Avg Sold</div>
                              <div className="font-bold text-emerald-400 text-lg">${avgSold}</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wide">Lowest Active</div>
                              <div className="font-bold text-white text-lg">${lowestActive}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => toggleComps(card.id)}
                              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                            >
                              {expandedComps[card.id] ? 'Hide Live Comps' : 'View Live Comps'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top min-w-[380px]">
                          <div className="bg-[#141414] border border-[#252525] rounded-xl p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1">Condition</label>
                                <input 
                                  type="text"
                                  className="border border-[#252525] rounded-lg px-2.5 py-1.5 w-full text-sm outline-none bg-[#0D0D0D] text-white font-medium focus:border-[#E8001C]"
                                  value={cPricing.condition}
                                  onChange={(e) => updatePricing(card.id, 'condition', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1">Sport</label>
                                <input 
                                  type="text"
                                  className="border border-[#252525] rounded-lg px-2.5 py-1.5 w-full text-sm outline-none bg-[#0D0D0D] text-white font-medium focus:border-[#E8001C]"
                                  value={cPricing.sport}
                                  onChange={(e) => updatePricing(card.id, 'sport', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1">Cost Basis ($)</label>
                                <input 
                                  type="number"
                                  className="border border-[#252525] rounded-lg px-2.5 py-1.5 w-full text-sm outline-none bg-[#0D0D0D] text-white font-mono font-semibold focus:border-[#E8001C]"
                                  value={cPricing.paidPrice}
                                  placeholder="0.00"
                                  onChange={(e) => updatePricing(card.id, 'paidPrice', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Price ($)</label>
                                <input 
                                  type="number"
                                  className="border border-[#252525] rounded-lg px-2.5 py-1.5 w-full text-sm outline-none bg-[#0D0D0D] text-white font-mono font-semibold focus:border-[#E8001C]"
                                  value={cPricing.askPrice}
                                  placeholder="0.00"
                                  onChange={(e) => updatePricing(card.id, 'askPrice', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="border-t border-[#252525] pt-3">
                              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Where did you buy it?</label>
                              <div className="flex flex-wrap gap-1.5">
                                {BUY_CHANNELS.map((c) => {
                                  const isSelected = cPricing.channel === c.key;
                                  const Icon = c.icon;
                                  return (
                                    <button
                                      key={c.key}
                                      type="button"
                                      onClick={() => updatePricing(card.id, 'channel', c.key)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        isSelected 
                                          ? `bg-[#E8001C]/15 border-[#E8001C] text-white shadow-sm` 
                                          : 'bg-[#0D0D0D] border-[#252525] text-zinc-300 hover:bg-[#1E1E1E]'
                                      }`}
                                    >
                                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E8001C]' : 'text-zinc-500'}`} />
                                      <span>{c.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="border-t border-[#252525] pt-3">
                              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Payment Method</label>
                              <div className="flex flex-wrap gap-1.5">
                                {PAYMENT_METHODS.map((m) => {
                                  const isSelected = cPricing.paymentMethod === m.key;
                                  const Icon = m.icon;
                                  return (
                                    <button
                                      key={m.key}
                                      type="button"
                                      onClick={() => updatePricing(card.id, 'paymentMethod', m.key)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        isSelected 
                                          ? `bg-[#E8001C]/15 border-[#E8001C] text-white shadow-sm` 
                                          : 'bg-[#0D0D0D] border-[#252525] text-zinc-300 hover:bg-[#1E1E1E]'
                                      }`}
                                    >
                                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E8001C]' : 'text-zinc-500'}`} />
                                      <span>{m.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {expandedComps[card.id] && (
                        <tr className="bg-[#141414] border-b border-[#252525]">
                          <td colSpan={4} className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div>
                                <h4 className="font-bold text-white text-sm mb-3">Recent Sold Items (30 Days)</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                  {card.comps?.last30Days?.items?.length > 0 ? (
                                    card.comps.last30Days.items.map((item: any, i: number) => {
                                      const imageUrl = item.image?.imageUrl || item.thumbnailUrl || item.fullResThumbnailUrl;
                                      return (
                                        <div key={i} className="flex gap-3 items-center p-3 bg-[#0D0D0D] border border-[#252525] rounded-lg shadow-sm">
                                          {imageUrl ? (
                                            <img src={imageUrl} alt="listing" className="h-10 w-10 rounded object-cover flex-shrink-0 bg-[#141414]" />
                                          ) : (
                                            <div className="h-10 w-10 rounded bg-[#141414] flex-shrink-0 flex items-center justify-center text-zinc-500">
                                              <CalendarClock className="h-4 w-4" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0 pr-2">
                                            <a href={item.url || item.itemWebUrl || (item.itemId ? `https://www.ebay.com/itm/${item.itemId}` : '#')} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-400 hover:underline truncate block">
                                              {item.title}
                                            </a>
                                            <div className="text-xs text-zinc-400 mt-1 flex gap-2 truncate">
                                              <span>{new Date(item.endDate || item.endedAt || item.soldAt).toLocaleDateString()}</span>
                                              <span>•</span>
                                              <span>{item.condition || 'Used'}</span>
                                            </div>
                                          </div>
                                          <div className="font-bold text-emerald-400 shrink-0">
                                            ${Number(item.soldPrice?.value || item.soldPrice || item.price || 0).toFixed(2)}
                                          </div>
                                        </div>
                                      )
                                    })
                                  ) : (
                                    <div className="text-sm text-zinc-400 italic p-3 bg-[#0D0D0D] border border-[#252525] rounded-lg">No recent sold comps found.</div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-white text-sm mb-3">Live Active Listings</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                  {card.comps?.activeListings?.length > 0 ? (
                                    card.comps.activeListings.map((item: any, i: number) => {
                                      const imageUrl = item.image?.imageUrl || item.thumbnailUrl || item.fullResThumbnailUrl;
                                      return (
                                        <div key={i} className="flex gap-3 items-center p-3 bg-[#0D0D0D] border border-[#252525] rounded-lg shadow-sm">
                                          {imageUrl ? (
                                            <img src={imageUrl} alt="listing" className="h-10 w-10 rounded object-cover flex-shrink-0 bg-[#141414]" />
                                          ) : (
                                            <div className="h-10 w-10 rounded bg-[#141414] flex-shrink-0 flex items-center justify-center text-zinc-500">
                                              <ReceiptText className="h-4 w-4" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0 pr-2">
                                            <a href={item.itemWebUrl || item.url || (item.itemId ? `https://www.ebay.com/itm/${item.itemId}` : '#')} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-400 hover:underline truncate block">
                                              {item.title}
                                            </a>
                                            <div className="text-xs text-zinc-400 mt-1 flex gap-2 truncate">
                                              <span>Seller: {item.seller?.username || item.platform || 'Unknown'}</span>
                                              <span>•</span>
                                              <span>{item.condition || 'Used'}</span>
                                            </div>
                                          </div>
                                          <div className="font-bold text-white shrink-0">
                                            ${Number(item.price?.value || item.price || 0).toFixed(2)}
                                          </div>
                                        </div>
                                      )
                                    })
                                  ) : (
                                    <div className="text-sm text-zinc-400 italic p-3 bg-[#0D0D0D] border border-[#252525] rounded-lg">No active listings found.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {status === 'saving' && (
          <div className="bg-[#0D0D0D] border border-[#252525] rounded-2xl p-12 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="w-10 h-10 text-[#E8001C] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Saving to Inventory...</h3>
            <p className="text-zinc-400">Writing {cards.length} cards to the database.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Successfully Added!</h3>
            <p className="text-zinc-300 mb-8 max-w-md text-center">
              All {cards.length} cards have been saved to your inventory with market analytics and pricing.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/inventory')}
                className="bg-[#141414] border border-[#252525] text-white hover:bg-[#1A1A1A] px-6 py-2.5 rounded-xl font-semibold shadow-sm transition"
              >
                View Inventory
              </button>
              <button
                onClick={() => { setStatus('idle'); setCards([]); setPricing({}); setBatchId(null); }}
                className="bg-[#E8001C] hover:bg-[#CC0018] text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition"
              >
                Upload More
              </button>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
