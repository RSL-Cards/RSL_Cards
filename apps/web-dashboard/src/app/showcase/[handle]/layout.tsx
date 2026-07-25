import React from "react";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <header className="bg-[#0D0D0D] border-b border-[#252525] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
              alt="RSL Cards Logo" 
              className="h-10 w-10 rounded-xl bg-[#141414] object-contain p-0.5 shadow-sm ring-1 ring-[#252525] transition-transform hover:scale-105"
            />
            {/* Fallback if image fails to load */}
            <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-[#E8001C] shadow-md">
              <span className="text-sm font-bold tracking-wider text-white">RSL</span>
            </div>
            <span className="font-bold text-white tracking-tight text-xl hidden sm:block">RSL Cards</span>
          </div>
          <div className="text-sm font-medium text-zinc-400">
            Dealer Showcase
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-[#0D0D0D] border-t border-[#252525] py-8 text-center text-zinc-500 text-sm">
        <p>&copy; {new Date().getFullYear()} RSL Cards. All rights reserved.</p>
        <p className="mt-2">Powered by the RSL Inventory System</p>
      </footer>
    </div>
  );
}
