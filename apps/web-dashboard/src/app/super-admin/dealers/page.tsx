'use client'

import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import { Store, CheckCircle, Search } from 'lucide-react'

export default function SuperAdminDealersPage() {
  return (
    <SuperAdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Dealers Management
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Super Admin
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Global management and verification overview for registered card dealers.
          </p>
        </div>

        {/* Dealers Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-400">Total Dealers</div>
            <div className="text-2xl font-extrabold text-white mt-1">12</div>
            <p className="text-xs text-emerald-400 mt-1">Active trading accounts</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-400">Verified Stores</div>
            <div className="text-2xl font-extrabold text-white mt-1">10</div>
            <p className="text-xs text-blue-400 mt-1">83% verification rate</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-400">Pending Review</div>
            <div className="text-2xl font-extrabold text-white mt-1">2</div>
            <p className="text-xs text-amber-400 mt-1">Requires approval</p>
          </div>
        </div>

        {/* Content Table Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Dealer Directory</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter dealers..."
                className="pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Dealer Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Inventory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                <tr>
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-400" />
                    Dealer One
                  </td>
                  <td className="px-4 py-3 text-zinc-400">dealer1@rsl.test</td>
                  <td className="px-4 py-3 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </td>
                  <td className="px-4 py-3 font-mono">10 cards</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-400" />
                    Dealer Two
                  </td>
                  <td className="px-4 py-3 text-zinc-400">dealer2@rsl.test</td>
                  <td className="px-4 py-3 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </td>
                  <td className="px-4 py-3 font-mono">10 cards</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminShell>
  )
}
