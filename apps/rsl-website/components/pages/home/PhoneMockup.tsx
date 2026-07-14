'use client'

import { useState, useEffect } from 'react'
import { Bell, Home, BarChart2, MoreHorizontal, Box, Plus, Zap, Camera, Check, ChevronLeft, Search, Activity, Image as ImageIcon, ScanLine, Tag, Menu } from 'lucide-react'

export default function PhoneMockup() {
  const [step, setStep] = useState(0)
  const [isClicking, setIsClicking] = useState(false)
  const [clickPos, setClickPos] = useState({ top: '50%', left: '50%' })

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let clickTimeout: NodeJS.Timeout

    const triggerClick = (top: string, left: string, nextStep: number, delay: number) => {
      timeout = setTimeout(() => {
        setClickPos({ top, left })
        setIsClicking(true)
        clickTimeout = setTimeout(() => {
          setIsClicking(false)
          setStep(nextStep)
        }, 300)
      }, delay)
    }

    if (step === 0) {
      // Home -> Click BUY on the tab bar footer (bottom center)
      triggerClick('91%', '50%', 1, 3000)
    } else if (step === 1) {
      // Scan -> Click Capture (bottom center)
      triggerClick('83%', '50%', 2, 2500)
    } else if (step === 2) {
      // Comps -> Click Confirm Deal (bottom center)
      triggerClick('92%', '50%', 3, 3000)
    } else if (step === 3) {
      // Confirm -> Click Add to Inventory (bottom center)
      triggerClick('92%', '50%', 4, 2500)
    } else if (step === 4) {
      // Inventory -> Click the new card at the top (top center)
      triggerClick('20%', '50%', 5, 2500)
    } else if (step === 5) {
      // Details -> Click Reports tab in footer (bottom right-ish)
      triggerClick('95%', '72.5%', 6, 3500)
    } else if (step === 6) {
      // Reports -> Click More tab in footer (bottom far right)
      triggerClick('95%', '90%', 7, 3000)
    } else if (step === 7) {
      // More -> Click Home tab to restart (bottom far left)
      triggerClick('95%', '10%', 0, 3000)
    }

    return () => {
      clearTimeout(timeout)
      clearTimeout(clickTimeout)
    }
  }, [step])

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="rounded-[36px] border border-white/15 bg-black p-2 shadow-2xl shadow-rslRed/20 overflow-hidden relative">
        <div className="overflow-hidden rounded-[28px] bg-[#09090b] text-white flex flex-col h-[740px] relative">
          
          {/* Universal Click Ripple */}
          {isClicking && (
            <div 
              className="absolute w-12 h-12 bg-white/40 rounded-full animate-ping pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2"
              style={{ top: clickPos.top, left: clickPos.left }}
            />
          )}

          {/* STEP 0: HOME SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-10 pb-4">
              <div className="flex items-center gap-3">
                <img src="/rslicon.jpeg" alt="RSL Logo" className="w-11 h-11 rounded-md object-contain" />
                <span className="text-zinc-400 italic font-semibold text-sm">PRO</span>
              </div>
              <div className="flex items-center gap-4">
                <Bell className="w-6 h-6 text-zinc-100" />
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
              <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-2">
                <div className="min-w-[100px] rounded-xl bg-[#111111] p-4 border border-[#2A2A2A]">
                  <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Bought</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0057FF]">2</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">cards</span>
                  </div>
                </div>
                <div className="min-w-[100px] rounded-xl bg-[#111111] p-4 border border-[#2A2A2A]">
                  <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Sold</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-red-500">0</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">cards</span>
                  </div>
                </div>
                <div className="min-w-[100px] rounded-xl bg-[#111111] p-4 border border-[#2A2A2A]">
                  <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Spent</div>
                  <div className="text-xl font-black text-zinc-300">$19.00</div>
                </div>
              </div>
              
              <div className="mt-6 px-5">
                <div className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mb-3">RSL Insights</div>
                <div className="rounded-2xl bg-[#111111] border border-[#2A2A2A] border-l-4 border-l-[#0057FF] p-5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Zap className="w-4 h-4 text-[#0057FF] fill-[#0057FF]" />
                      <span className="text-[#0057FF] uppercase tracking-wider">BREAKOUT</span>
                    </div>
                    <div className="text-[#00C853] font-black text-sm">18.50%</div>
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-3">Mahomes base cards surge 18.5% after AFC Championship</h3>
                  <div className="text-zinc-400 text-sm font-semibold">
                    $2132 <span className="mx-2 text-[#555555]">→</span> <span className="text-white">$2527</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 px-5">
                <div className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mb-3">Recent Activity</div>
                <div className="rounded-2xl bg-[#111111] border border-[#2A2A2A] p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0057FF]/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#0057FF]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Purchased Mahomes Prizm</div>
                    <div className="text-xs text-zinc-500 mt-1">Today at 10:42 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: SCANNER SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-black transition-opacity duration-500 ${step === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="absolute top-12 inset-x-0 z-20 flex justify-center">
              <div className="bg-black/60 backdrop-blur-md flex rounded-full border border-white/10 p-1">
                <div className="px-4 py-1.5 bg-zinc-800 rounded-full text-xs font-bold">Scan</div>
                <div className="px-4 py-1.5 text-zinc-400 text-xs font-bold">Barcode</div>
                <div className="px-4 py-1.5 text-zinc-400 text-xs font-bold">Search</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
              <div className="w-full h-full opacity-60 bg-[url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute w-[280px] h-[400px] border-2 border-white/20 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0057FF] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0057FF] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0057FF] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0057FF] rounded-br-xl" />
                
                {/* Scanning line animation */}
                <div className="absolute top-0 w-full h-[3px] bg-[#0057FF] shadow-[0_0_20px_#0057FF] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-black/80 backdrop-blur-lg flex items-center justify-center gap-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10"><ImageIcon className="w-5 h-5" /></div>
              <div className={`w-20 h-20 rounded-full border-4 border-[#0057FF]/40 flex items-center justify-center transition-transform ${isClicking && step === 1 ? 'scale-90 bg-white/20' : ''}`}>
                <div className="w-16 h-16 rounded-full bg-white" />
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10"><span className="font-bold text-xs">A/a</span></div>
            </div>
          </div>

          {/* STEP 2: COMPS / DATA SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <ChevronLeft className="w-6 h-6" />
                <span className="font-bold">Step 2/4 · BUY</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar pb-28">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-[#222222] rounded-lg">
                  <img src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[15px] leading-tight mb-2">2017 Panini Prizm Patrick Mahomes II Base</div>
                  <div className="bg-[#FFD700] rounded-md px-2 py-0.5 self-start inline-block">
                    <span className="text-black font-bold text-[11px]">PSA 10</span>
                  </div>
                </div>
              </div>

              {/* Deal Rating Badge */}
              <div className="bg-[#00C853] rounded-full py-2.5 px-6 flex items-center justify-center gap-2 self-center mx-auto">
                <span className="text-white font-bold text-base">🔥</span>
                <span className="text-white font-black text-[15px] tracking-[1px]">GREAT DEAL</span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2A2A2A] mt-2">
                <div className="pb-3 border-b-2 border-white px-2 flex-1 text-center font-bold text-sm">eBay Sold</div>
                <div className="pb-3 px-2 flex-1 text-center font-bold text-sm text-[#555555]">eBay Active</div>
                <div className="pb-3 px-2 flex-1 text-center font-bold text-sm text-[#555555]">MySlabs</div>
              </div>

              {/* Price Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111111] p-4 rounded-2xl border border-[#2A2A2A] items-center flex flex-col">
                  <div className="text-[10px] text-[#555555] font-bold uppercase tracking-[1.5px] mb-1">Market Avg</div>
                  <div className="text-[36px] font-black text-white">$2,145</div>
                </div>
                <div className="bg-[#111111] p-4 rounded-2xl border border-[#2A2A2A] items-center flex flex-col">
                  <div className="text-[10px] text-[#555555] font-bold uppercase tracking-[1.5px] mb-1">Cost Basis</div>
                  <div className="text-[36px] font-black text-[#00C853]">$1,850</div>
                </div>
              </div>

              {/* Sales List */}
              <div className="space-y-0 border border-[#2A2A2A] rounded-2xl bg-[#111111] overflow-hidden">
                {[
                  { price: '$2,150.00', date: 'Oct 24', type: 'Auction' },
                  { price: '$2,135.50', date: 'Oct 23', type: 'Buy It Now' },
                ].map((sale, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 ${i !== 1 ? 'border-b border-[#2A2A2A]' : ''}`}>
                    <div className="flex items-center">
                      <div className="font-bold text-[15px]">{sale.price}</div>
                      <div className="bg-[#0057FF]/15 px-2 py-0.5 rounded-md ml-3">
                        <span className="text-[#0057FF] text-[11px] font-bold">{sale.type}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[#555555]">{sale.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-[#2A2A2A] bg-black">
              <div className={`h-14 rounded-2xl bg-[#0057FF] text-white flex items-center justify-center font-bold text-lg transition-transform ${isClicking && step === 2 ? 'scale-95' : ''}`}>
                Confirm Deal
              </div>
            </div>
          </div>

          {/* STEP 3: CONFIRM SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-400">
                <ChevronLeft className="w-6 h-6" />
                <span className="font-bold">Step 4/4 · CONFIRM</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-28">
              <div className="text-center mt-4">
                <div className="text-[11px] font-bold text-[#888888] mb-2 uppercase tracking-widest">Purchase Price</div>
                <div className="text-6xl font-black text-white">$1,850</div>
              </div>

              <div className="mt-8">
                <div className="text-[11px] font-bold text-[#888888] uppercase tracking-[1.5px] mb-3">Payment Method</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0057FF] text-white py-4 rounded-xl text-center font-bold text-sm">💵 Cash</div>
                  <div className="bg-[#111111] border border-[#2A2A2A] py-4 rounded-xl text-center font-bold text-sm text-[#555555]">💙 Zelle</div>
                  <div className="bg-[#111111] border border-[#2A2A2A] py-4 rounded-xl text-center font-bold text-sm text-[#555555]">🅿️ PayPal</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-[#888888] uppercase tracking-[1.5px] mb-3">Notes</div>
                <div className="bg-[#111111] border border-[#2A2A2A] h-24 rounded-xl p-4 text-sm text-[#555555]">
                  Add notes about condition or dealer...
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-[#2A2A2A] bg-black">
              <div className={`h-14 rounded-2xl bg-[#0057FF] flex items-center justify-center font-bold text-lg transition-transform ${isClicking && step === 3 ? 'scale-95 brightness-110' : ''}`}>
                Add to Inventory
              </div>
            </div>
          </div>

          {/* STEP 4: INVENTORY LIST */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 4 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/10">
              <div className="font-bold text-xl">Inventory</div>
              <div className="flex gap-4 text-zinc-400">
                <Search className="w-5 h-5" />
                <Activity className="w-5 h-5" />
              </div>
            </div>

            {/* Success Toast Overlay */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/50 text-green-400 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-green-500/10 z-20 animate-[slideDown_0.5s_ease-out]">
              <Check className="w-4 h-4" /> Card Added
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar mt-4 pb-28">
              <div className={`flex gap-4 p-4 rounded-2xl bg-[#111111] border border-[#0057FF] shadow-[0_0_15px_rgba(0,87,255,0.15)] relative overflow-hidden transition-colors ${isClicking && step === 4 ? 'bg-[#1a1a1a]' : ''}`}>
                <div className="w-14 h-20 bg-[#222222] rounded-lg">
                  <img src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="font-bold leading-tight line-clamp-1 text-sm">2017 Panini Prizm Patrick Mahomes II Base</div>
                  <div className="text-[11px] text-[#888888] mt-1 font-semibold">PSA 10 • Cost: $1,850</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[15px] font-black text-white">$2,145</span>
                    <span className="text-[10px] font-bold text-[#00C853] bg-[#00C853]/15 px-1.5 py-0.5 rounded">+$295</span>
                  </div>
                </div>
              </div>

              {[
                { name: '2020 Bowman Chrome Jasson Dominguez', psa: 'BGS 9.5', cost: '$450', value: '$600', profit: '+$150' },
                { name: '2003 Topps Chrome Lebron James', psa: 'PSA 9', cost: '$3200', value: '$3100', profit: '-$100', negative: true },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#111111] border border-[#2A2A2A]">
                  <div className="w-14 h-20 bg-[#222222] rounded-lg" />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="font-bold leading-tight line-clamp-1 text-sm">{item.name}</div>
                    <div className="text-[11px] text-[#888888] mt-1 font-semibold">{item.psa} • Cost: {item.cost}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[15px] font-black text-white">{item.value}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.negative ? 'text-[#E8001C] bg-[#E8001C]/15' : 'text-[#00C853] bg-[#00C853]/15'}`}>
                        {item.profit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 5: CARD DETAILS */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 5 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-2">
              <ChevronLeft className="w-6 h-6 text-white" />
              <div className="flex gap-4">
                <Tag className="w-5 h-5 text-zinc-400" />
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
              <div className="w-full h-[300px] bg-[#111] p-4 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=400&q=80" className="max-h-full max-w-full object-contain" />
              </div>
              
              <div className="p-5">
                <div className="inline-block bg-white text-black font-black text-xs px-2 py-1 uppercase tracking-wider mb-3">PSA 10</div>
                <h2 className="text-xl font-black leading-tight mb-2">2017 Panini Prizm Patrick Mahomes II Base #269</h2>
                <div className="text-zinc-400 text-sm mb-6">Football • Panini Prizm</div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Est. Value</div>
                    <div className="text-2xl font-black text-white">$2,145.00</div>
                  </div>
                  <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total Gain</div>
                    <div className="text-2xl font-black text-green-500">+$295.00</div>
                  </div>
                </div>

                <div className="bg-[#18181b] rounded-xl border border-white/5 p-4 h-40 flex items-end gap-2">
                  {/* Fake Chart */}
                  {[40, 45, 42, 50, 60, 55, 65, 75, 80, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#5252ff]/80 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: REPORTS */}
          <div className={`absolute inset-0 bg-[#000000] flex flex-col transition-transform duration-500 ${step === 6 ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center px-5 pt-14 pb-2">
              <div className="text-3xl font-black tracking-tight">Reports</div>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Menu className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex px-5 mb-4 gap-2">
              <div className="bg-[#111111] border border-[#2A2A2A] px-4 py-1.5 rounded-full"><span className="text-white font-bold text-sm">Today</span></div>
              <div className="px-4 py-1.5"><span className="text-[#888888] font-bold text-sm">Week</span></div>
              <div className="px-4 py-1.5"><span className="text-[#888888] font-bold text-sm">Month</span></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28 no-scrollbar">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Bought", value: "2", unit: "cards", color: "text-[#0057FF]" },
                  { label: "Sold", value: "0", unit: "cards", color: "text-[#E8001C]" },
                  { label: "Spent", value: "$1,850", color: "text-zinc-400" },
                  { label: "Revenue", value: "$0", color: "text-white" },
                  { label: "Profit", value: "$0", color: "text-[#00C853]" },
                  { label: "Margin", value: "0%", color: "text-[#0057FF]" },
                ].map((m, i) => (
                  <div key={i} className="bg-[#111111] p-4 rounded-xl border border-[#2A2A2A]">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{m.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${m.color}`}>{m.value}</span>
                      {m.unit && <span className="text-[10px] text-zinc-500 font-bold">{m.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mb-3">Last 24H Transactions</div>
              <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] overflow-hidden mb-6">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/15 flex items-center justify-center">
                      <span className="text-[#0057FF] font-black text-lg">B</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">2017 Panini Prizm...</div>
                      <div className="text-xs text-zinc-500 mt-0.5">10:42 AM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">$1850</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 7: MORE */}
          <div className={`absolute inset-0 bg-[#000000] flex flex-col transition-transform duration-500 ${step === 7 ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-5 pt-14 pb-4">
              <div className="text-3xl font-black tracking-tight">More</div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
              <div className="flex items-center gap-4 px-5 mb-8">
                <div className="w-14 h-14 rounded-full bg-[#E8001C] flex items-center justify-center">
                  <span className="text-white font-black text-xl">RSL</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-black text-lg">RSL Cards</div>
                    <div className="bg-[#4F46E5]/15 border border-[#4F46E5]/30 px-1.5 py-0.5 rounded">
                      <span className="text-[9px] font-black text-[#0057FF]">PRO</span>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">dealer@rslcards.com</div>
                </div>
                <div className="text-[#0057FF] font-bold text-sm">Edit</div>
              </div>

              <div className="px-5 mb-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Business</div>
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3"><span className="text-lg">👥</span><span className="font-bold text-sm">Customers</span></div>
                    <span className="text-zinc-600 text-lg">›</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3"><span className="text-lg">📅</span><span className="font-bold text-sm">Card Shows</span></div>
                    <span className="text-zinc-600 text-lg">›</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3"><span className="text-lg">📋</span><span className="font-bold text-sm">My Listings</span></div>
                    <span className="text-zinc-600 text-lg">›</span>
                  </div>
                </div>
              </div>
              
              <div className="px-5 mt-6">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Platforms</div>
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3"><span className="text-lg">🛒</span><span className="font-bold text-sm">eBay</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">⚫ Connect</span>
                      <span className="text-zinc-600 text-lg">›</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3"><span className="text-lg">🗂️</span><span className="font-bold text-sm">MySlabs</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">⚫ Connect</span>
                      <span className="text-zinc-600 text-lg">›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Static Bottom Nav (Always visible) */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#000000] border-t border-[#2A2A2A] flex justify-between px-2 pt-2 pb-6 z-50">
            <div className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform ${isClicking && step === 7 ? 'scale-95' : ''}`}>
              <Home className={`w-5 h-5 ${step === 0 ? 'text-[#0057FF]' : 'text-zinc-500'}`} />
              <span className={`text-[10px] mt-1 font-bold ${step === 0 ? 'text-[#0057FF]' : 'text-zinc-500'}`}>Home</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-1">
              <Box className={`w-5 h-5 ${step === 4 ? 'text-[#0057FF]' : 'text-zinc-500'}`} />
              <span className={`text-[10px] mt-1 font-bold ${step === 4 ? 'text-[#0057FF]' : 'text-zinc-500'}`}>Inventory</span>
            </div>
            
            {/* Center + Button */}
            <div className="flex-1 flex items-center justify-center -mt-6">
              <div className={`w-14 h-14 rounded-full bg-[#0057FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,87,255,0.4)] ${isClicking && step === 0 ? 'scale-95' : ''}`}>
                <span className="text-white text-3xl font-black mb-1">+</span>
              </div>
              <span className="absolute bottom-1 text-[10px] text-[#555555] font-bold uppercase">Buy</span>
            </div>

            <div className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform ${isClicking && step === 5 ? 'scale-95' : ''}`}>
              <BarChart2 className={`w-5 h-5 ${step === 6 ? 'text-[#0057FF]' : 'text-zinc-500'}`} />
              <span className={`text-[10px] mt-1 font-bold ${step === 6 ? 'text-[#0057FF]' : 'text-zinc-500'}`}>Reports</span>
            </div>
            <div className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform ${isClicking && step === 6 ? 'scale-95' : ''}`}>
              <MoreHorizontal className={`w-5 h-5 ${step === 7 ? 'text-[#0057FF]' : 'text-zinc-500'}`} />
              <span className={`text-[10px] mt-1 font-bold ${step === 7 ? 'text-[#0057FF]' : 'text-zinc-500'}`}>More</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
