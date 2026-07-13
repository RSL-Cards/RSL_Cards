import React from "react";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
              alt="RSL Cards Logo" 
              className="h-10 w-10 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-gray-200 transition-transform hover:scale-105"
            />
            {/* Fallback if image fails to load */}
            <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 shadow-md ring-1 ring-indigo-500/30">
              <span className="text-sm font-bold tracking-wider text-white">RSL</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-xl hidden sm:block">RSL Cards</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Dealer Showcase
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} RSL Cards. All rights reserved.</p>
        <p className="mt-2">Powered by the RSL Inventory System</p>
      </footer>
    </div>
  );
}
