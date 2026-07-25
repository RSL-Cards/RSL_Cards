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
      // Home -> Click BUY (+) center floating button
      triggerClick('94%', '50%', 1, 3000)
    } else if (step === 1) {
      // Scan -> Click Capture shutter button
      triggerClick('84%', '50%', 2, 2500)
    } else if (step === 2) {
      // Comps -> Click Confirm Deal button
      triggerClick('92%', '50%', 3, 3000)
    } else if (step === 3) {
      // Confirm -> Click Add to Inventory button
      triggerClick('92%', '50%', 4, 2500)
    } else if (step === 4) {
      // Inventory -> Click the Lionel Messi card item to open [id].tsx card details
      triggerClick('28%', '50%', 5, 2500)
    } else if (step === 5) {
      // Details -> Click Reports tab in footer
      triggerClick('95%', '72.5%', 6, 3500)
    } else if (step === 6) {
      // Reports -> Click More tab in footer
      triggerClick('95%', '90%', 7, 3000)
    } else if (step === 7) {
      // More -> Click Home tab to restart
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
            <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img src="/rslicon.jpeg" alt="RSL Logo" className="w-9 h-9 rounded-md object-contain" />
                <span className="bg-[#0057FF]/15 border border-[#0057FF]/30 text-[#0057FF] font-black text-[10px] px-2 py-0.5 rounded-full">PRO</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative p-1">
                  <Bell className="w-5 h-5 text-zinc-300" />
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#E8001C] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                  VK
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
              {/* ── ACTIVE DAILY LOG ── */}
              <div className="px-5 py-2 mt-1">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00C853]" />
                      <span className="text-xs font-bold text-zinc-100">Dallas Card Show</span>
                    </div>
                    <span className="text-xs font-bold text-[#E8001C] cursor-pointer">Close</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Money In</div>
                      <div className="text-sm font-black text-[#00C853]">$2,450.00</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Money Out</div>
                      <div className="text-sm font-black text-[#E8001C]">$1,850.00</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Profit</div>
                      <div className="text-sm font-black text-zinc-50">$600.00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── WORKFLOW BUTTONS (HERO) ── */}
              <div className="px-5 mt-3">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-[#0057FF] hover:bg-blue-600 rounded-[14px] h-[54px] flex items-center justify-center font-bold text-white text-[15px] shadow-lg shadow-blue-600/20">
                    Buy
                  </div>
                  <div className="flex-1 bg-[#E8001C] hover:bg-red-600 rounded-[14px] h-[54px] flex items-center justify-center font-bold text-white text-[15px] shadow-lg shadow-red-600/20">
                    Sell
                  </div>
                </div>
                <div className="w-full rounded-[14px] h-[46px] flex items-center justify-center font-bold text-zinc-200 border border-zinc-700 bg-zinc-900/50 text-[14px]">
                  Add Expense
                </div>
              </div>

              {/* ── ACTIVE DEALS ── */}
              <div className="mt-6">
                <div className="px-5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2.5">Active Deals</div>
                <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-2">
                  <div className="min-w-[160px] rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md relative">
                    <div className="font-bold text-sm truncate mb-1 text-white pr-4">Messi Prizm World Cup</div>
                    <div className="text-[10px] text-zinc-400 font-semibold">Step 2/5 · BUY</div>
                    <div className="absolute top-3.5 right-3 text-zinc-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </div>
                  </div>
                  <div className="min-w-[160px] rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md relative">
                    <div className="font-bold text-sm truncate mb-1 text-white pr-4">Haaland Chrome Auto</div>
                    <div className="text-[10px] text-zinc-400 font-semibold">Step 1/5 · SELL</div>
                    <div className="absolute top-3.5 right-3 text-zinc-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TODAY'S ACTIVITY ── */}
              <div className="mt-6 px-5 pb-6">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2.5">Today's Activity</div>
                <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/10">
                  <div className="flex items-center p-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#0057FF]/15 border border-[#0057FF]/30 flex items-center justify-center mr-3 shrink-0">
                      <span className="text-[#0057FF] font-black text-xs">B</span>
                    </div>
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-semibold text-sm text-white truncate">Lionel Messi Prizm WC</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">10:42 AM</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-white">$1,150.00</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#E8001C]/15 border border-[#E8001C]/30 flex items-center justify-center mr-3 shrink-0">
                      <span className="text-[#E8001C] font-black text-xs">S</span>
                    </div>
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-semibold text-sm text-white truncate">Haaland Topps Chrome RC</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">09:15 AM</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-white">$850.00</div>
                      <div className="text-[10px] font-bold text-[#00C853] mt-0.5">+$200.00</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00C853]/15 border border-[#00C853]/30 flex items-center justify-center mr-3 shrink-0">
                      <span className="text-[#00C853] font-black text-xs">TR</span>
                    </div>
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-semibold text-sm text-white truncate">Traded Patrick Mahomes → C.J. Stroud</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">08:30 AM · Trade</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-[#00C853]">Straight Trade</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: SCANNER SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-black transition-opacity duration-500 ${step === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-black/90 backdrop-blur-md z-20 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-300">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Scan Card</span>
              </div>
              <div className="flex bg-zinc-900 border border-white/10 rounded-full p-0.5">
                <span className="px-3 py-1 bg-[#0057FF] text-white text-[11px] font-bold rounded-full">Single</span>
                <span className="px-3 py-1 text-zinc-400 text-[11px] font-bold">Batch</span>
              </div>
            </div>

            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <div className="w-full h-full opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('/s-l400.png')" }} />
              <div className="absolute inset-0 bg-black/60" />
              <div className="absolute w-[270px] h-[380px] border-2 border-white/20 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl bg-zinc-900/40 backdrop-blur-xs">
                <img src="/s-l400.png" alt="Scanned Card" className="w-[85%] h-[85%] object-contain rounded-xl drop-shadow-2xl" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0057FF] rounded-tl-2xl z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0057FF] rounded-tr-2xl z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0057FF] rounded-bl-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0057FF] rounded-br-2xl z-10" />
                
                {/* Scanning line animation */}
                <div className="absolute top-0 w-full h-[3px] bg-[#0057FF] shadow-[0_0_20px_#0057FF] animate-[scan_2s_ease-in-out_infinite] z-20" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-black/90 backdrop-blur-lg flex items-center justify-center gap-8 pb-4 border-t border-white/10 z-20">
              <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-zinc-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className={`w-20 h-20 rounded-full border-4 border-[#0057FF]/40 flex items-center justify-center transition-transform cursor-pointer ${isClicking && step === 1 ? 'scale-90 bg-white/20' : ''}`}>
                <div className="w-16 h-16 rounded-full bg-white shadow-lg" />
              </div>
              <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-zinc-300">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* STEP 2: COMPS / DATA SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-300">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Step 2/5 · BUY</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-28">
              <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <img src="/s-l400.png" alt="Card Comps" className="w-14 h-18 rounded-lg object-contain bg-zinc-900 border border-white/10 shrink-0 p-0.5 shadow-md" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="font-bold text-sm leading-tight text-white truncate">2022 Panini Prizm World Cup Lionel Messi #7</div>
                  <div className="mt-1.5 self-start">
                    <span className="bg-[#FFD700] text-zinc-950 font-black text-[10px] px-2 py-0.5 rounded">PSA 10</span>
                  </div>
                </div>
              </div>

              {/* Deal Rating Badge */}
              <div className="bg-[#00C853]/15 border border-[#00C853]/40 rounded-full py-2 px-5 flex items-center justify-center gap-2 self-center mx-auto">
                <span className="text-white font-bold text-xs">🔥</span>
                <span className="text-[#00C853] font-black text-xs tracking-[1px]">GREAT DEAL</span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mt-1">
                <div className="pb-2.5 border-b-2 border-[#0057FF] px-2 flex-1 text-center font-bold text-xs text-[#0057FF]">eBay Sold</div>
                <div className="pb-2.5 px-2 flex-1 text-center font-bold text-xs text-zinc-500">eBay Active</div>
                <div className="pb-2.5 px-2 flex-1 text-center font-bold text-xs text-zinc-500">MySlabs</div>
              </div>

              {/* Price Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 items-center flex flex-col">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Market Avg</div>
                  <div className="text-2xl font-black text-white">$1,450.00</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 items-center flex flex-col">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Target Price</div>
                  <div className="text-2xl font-black text-[#00C853]">$1,150.00</div>
                </div>
              </div>

              {/* Sales List */}
              <div className="space-y-0 border border-white/10 rounded-2xl bg-white/5 overflow-hidden divide-y divide-white/10">
                {[
                  { price: '$1,460.00', date: 'Oct 24', type: 'Auction' },
                  { price: '$1,440.00', date: 'Oct 23', type: 'Buy It Now' },
                ].map((sale, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5">
                    <div className="flex items-center">
                      <div className="font-bold text-sm text-white">{sale.price}</div>
                      <div className="bg-[#0057FF]/15 border border-[#0057FF]/30 px-2 py-0.5 rounded-md ml-3">
                        <span className="text-[#0057FF] text-[10px] font-bold">{sale.type}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-zinc-400">{sale.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#09090b]">
              <div className={`h-13 rounded-xl bg-[#0057FF] text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-600/20 cursor-pointer transition-transform ${isClicking && step === 2 ? 'scale-95' : ''}`}>
                Confirm Deal
              </div>
            </div>
          </div>

          {/* STEP 3: CONFIRM SCREEN */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-300">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Step 4/5 · CONFIRM</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar pb-28">
              <div className="text-center mt-2">
                <div className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-widest">Purchase Price</div>
                <div className="text-5xl font-black text-white">$1,150.00</div>
              </div>

              <div className="mt-6">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Payment Method</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0057FF] text-white py-3 rounded-xl text-center font-bold text-xs shadow-md">💵 Cash</div>
                  <div className="bg-white/5 border border-white/10 py-3 rounded-xl text-center font-bold text-xs text-zinc-400">💙 Zelle</div>
                  <div className="bg-white/5 border border-white/10 py-3 rounded-xl text-center font-bold text-xs text-zinc-400">🅿️ PayPal</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Purchase Location / Channel</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0057FF] text-white py-3 rounded-xl text-center font-bold text-xs">Dallas Card Show</div>
                  <div className="bg-white/5 border border-white/10 py-3 rounded-xl text-center font-bold text-xs text-zinc-400">Local Deal</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Deal Notes</div>
                <div className="bg-white/5 border border-white/10 h-20 rounded-xl p-3 text-xs text-zinc-400">
                  Bought from Table 42 · Clean PSA 10 slab...
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#09090b]">
              <div className={`h-13 rounded-xl bg-[#0057FF] text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-600/20 cursor-pointer transition-transform ${isClicking && step === 3 ? 'scale-95 brightness-110' : ''}`}>
                Add to Inventory
              </div>
            </div>
          </div>

          {/* STEP 4: INVENTORY LIST */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 4 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="px-5 pt-12 pb-3 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-2xl text-white">Inventory</div>
                  <div className="text-xs text-zinc-400 font-medium">3 active cards</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              
              {/* Dedicated Action Row */}
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 text-white font-bold text-xs py-2.5 rounded-xl text-center">
                  Trade
                </div>
                <div className="flex-1 bg-[#0057FF] text-white font-bold text-xs py-2.5 rounded-xl text-center shadow-md">
                  Add Existing Card
                </div>
              </div>

              {/* Active / History Switcher */}
              <div className="flex bg-zinc-900/80 border border-white/10 rounded-xl p-1">
                <div className="flex-1 bg-white/10 py-1.5 text-center font-bold text-xs text-white rounded-lg">Active</div>
                <div className="flex-1 py-1.5 text-center font-bold text-xs text-zinc-500">History</div>
              </div>

              {/* Category Chips Bar */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-0.5">
                <span className="px-3 py-1 bg-[#0057FF] text-white text-[11px] font-bold rounded-full shrink-0">All</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-bold rounded-full shrink-0">Soccer</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-bold rounded-full shrink-0">Football</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-bold rounded-full shrink-0">Basketball</span>
              </div>
            </div>

            {/* Success Toast Overlay */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#18181b] border border-[#00C853]/50 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-2xl shadow-green-500/20 z-40 animate-[slideDown_0.5s_ease-out]">
              <div className="w-5 h-5 rounded-full bg-[#00C853]/20 border border-[#00C853] flex items-center justify-center text-[#00C853] shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs leading-none">Added to Inventory</div>
                <div className="text-[10px] text-zinc-400 font-normal truncate mt-0.5">2022 Panini Prizm Lionel Messi #7</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar pb-28">
              <div className={`flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-[#0057FF] shadow-[0_0_15px_rgba(0,87,255,0.15)] relative overflow-hidden transition-colors ${isClicking && step === 4 ? 'bg-[#1a1a1a]' : ''}`}>
                <img src="/s-l400.png" alt="Lionel Messi Card" className="w-14 h-20 bg-zinc-900 rounded-lg object-contain border border-white/10 shrink-0 p-0.5 shadow-md" />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold leading-tight truncate text-sm text-white">Lionel Messi</div>
                    <span className="bg-[#FFD700] text-zinc-950 font-black text-[9px] px-1.5 py-0.5 rounded shrink-0">PSA 10</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-medium truncate">2022 Panini Prizm World Cup #7</div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                    <div className="text-[11px] text-zinc-400">
                      Cost: <span className="font-bold text-white">$1,150.00</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">$1,450.00</span>
                      <span className="text-[10px] font-bold text-[#00C853] bg-[#00C853]/15 border border-[#00C853]/30 px-1.5 py-0.5 rounded">+$300.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {[
                { name: 'Erling Haaland', set: '2019 Topps Chrome UEFA #74', psa: 'PSA 10', cost: '$650.00', value: '$850.00', profit: '+$200.00' },
                { name: 'Kylian Mbappé', set: '2018 Panini Prizm World Cup #80', psa: 'PSA 9', cost: '$400.00', value: '$380.00', profit: '-$20.00', negative: true },
              ].map((item, i) => (
                <div key={i} className="flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-14 h-20 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0">
                    SOCCER
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold leading-tight truncate text-sm text-white">{item.name}</div>
                      <span className="bg-[#1A1A1A] border border-amber-500/40 text-amber-400 font-bold text-[9px] px-1.5 py-0.5 rounded shrink-0">{item.psa}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-medium truncate">{item.set}</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                      <div className="text-[11px] text-zinc-400">
                        Cost: <span className="font-bold text-white">{item.cost}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">{item.value}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.negative ? 'text-[#E8001C] bg-[#E8001C]/15 border border-[#E8001C]/30' : 'text-[#00C853] bg-[#00C853]/15 border border-[#00C853]/30'}`}>
                          {item.profit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 5: CARD DETAILS */}
          <div className={`absolute inset-0 flex flex-col bg-[#09090b] transition-opacity duration-500 ${step === 5 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-300">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Card Details</span>
              </div>
              <div className="flex gap-3 text-zinc-400">
                <Tag className="w-4 h-4" />
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
              <div className="w-full h-[250px] bg-[#111] p-4 flex items-center justify-center bg-gradient-to-b from-blue-950/30 to-[#09090b]">
                <img src="/s-l400.png" alt="Lionel Messi Slab Card" className="h-48 object-contain rounded-xl drop-shadow-2xl" />
              </div>
              
              <div className="p-5">
                <div className="inline-block bg-[#FFD700] text-zinc-950 font-black text-[11px] px-2.5 py-0.5 rounded-md mb-2">PSA 10</div>
                <h2 className="text-lg font-extrabold text-white leading-tight mb-1">2022 Panini Prizm World Cup Lionel Messi #7</h2>
                <div className="text-zinc-400 text-xs mb-5">Soccer • Panini Prizm World Cup</div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Est. Value</div>
                    <div className="text-xl font-black text-white">$1,450.00</div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total Gain</div>
                    <div className="text-xl font-black text-[#00C853]">+$300.00</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 h-36 flex items-end gap-2">
                  {/* Price History Line Graph Visual */}
                  {[40, 45, 42, 50, 60, 55, 65, 75, 80, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#0057FF] rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>

                <div className="flex gap-3 mt-5">
                  <div className="flex-1 bg-[#E8001C] text-white py-3 rounded-xl text-center font-bold text-xs shadow-md">
                    Sell Card
                  </div>
                  <div className="flex-1 bg-[#0057FF] text-white py-3 rounded-xl text-center font-bold text-xs shadow-md">
                    List on eBay
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: REPORTS */}
          <div className={`absolute inset-0 bg-[#09090b] flex flex-col transition-transform duration-500 ${step === 6 ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center px-5 pt-12 pb-3 border-b border-white/10">
              <div className="font-extrabold text-xl text-white">Reports</div>
              <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-0.5">
                <span className="px-2.5 py-1 bg-zinc-800 text-white text-[11px] font-bold rounded-md">Performance</span>
                <span className="px-2.5 py-1 text-zinc-400 text-[11px] font-bold">Daily Logs</span>
              </div>
            </div>
            
            <div className="flex px-5 my-3 gap-2 border-b border-white/10 pb-2">
              <div className="border-b-2 border-[#0057FF] pb-2 px-2"><span className="text-[#0057FF] font-bold text-xs">Today</span></div>
              <div className="pb-2 px-2"><span className="text-zinc-500 font-bold text-xs">7 Days</span></div>
              <div className="pb-2 px-2"><span className="text-zinc-500 font-bold text-xs">30 Days</span></div>
              <div className="pb-2 px-2"><span className="text-zinc-500 font-bold text-xs">YTD</span></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28 no-scrollbar space-y-4">
              {/* Hero Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Net Profit</div>
                <div className="text-4xl font-black text-[#00C853]">$600.00</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Cards Bought", value: "2", color: "text-[#0057FF]" },
                  { label: "Cards Sold", value: "1", color: "text-[#00C853]" },
                  { label: "Total Spent", value: "$1,150.00", color: "text-zinc-300" },
                  { label: "Total Revenue", value: "$850.00", color: "text-white" },
                  { label: "Net Profit", value: "$600.00", color: "text-[#00C853]" },
                  { label: "Avg Margin", value: "32.4%", color: "text-[#0057FF]" },
                ].map((m, i) => (
                  <div key={i} className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">{m.label}</div>
                    <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 7: MORE */}
          <div className={`absolute inset-0 bg-[#09090b] flex flex-col transition-transform duration-500 ${step === 7 ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-5 pt-12 pb-3 border-b border-white/10">
              <div className="font-extrabold text-xl text-white">More</div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-28 no-scrollbar p-5 space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full bg-[#E8001C] flex items-center justify-center font-bold text-white text-base shadow-md">
                  VK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm text-white truncate">Vinay K</div>
                    <span className="bg-[#0057FF]/15 border border-[#0057FF]/30 text-[#0057FF] font-black text-[9px] px-2 py-0.5 rounded-full">PRO</span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate mt-0.5">dealer@rslcards.com</div>
                </div>
                <span className="text-[#0057FF] font-bold text-xs">Edit</span>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2.5">MARKETPLACE CONNECTIONS</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">🛒</span>
                      <span className="font-semibold text-sm text-white">eBay</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#00C853] bg-[#00C853]/15 border border-[#00C853]/30 px-2 py-0.5 rounded">🟢 Connected</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2.5">SUPPORT & SETTINGS</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-semibold text-sm text-white">Notification Preferences</span>
                    <span className="text-zinc-500 text-xs">›</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-semibold text-sm text-white">Help & Support</span>
                    <span className="text-zinc-500 text-xs">›</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-semibold text-sm text-white">Privacy & Terms</span>
                    <span className="text-zinc-500 text-xs">›</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-semibold text-sm text-white">Version</span>
                    <span className="text-xs text-zinc-400 font-medium">1.0.0</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="w-full bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] py-3 rounded-xl text-center font-bold text-xs">
                  Sign Out
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
