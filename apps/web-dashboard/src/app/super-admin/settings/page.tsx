'use client'

import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import { Settings, Sliders, Shield, Key } from 'lucide-react'

export default function SuperAdminSettingsPage() {
  return (
    <SuperAdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="h-7 w-7 text-red-500" />
            Super Admin Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Global system configurations, feature flags, and security controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security & Access Section */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
              <Shield className="h-5 w-5 text-red-400" />
              <h2 className="font-semibold text-white text-base">Security & Global Auth</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Configure system-wide authentication requirements and super-admin privilege escalation flags.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs">
                <span className="font-medium text-zinc-200">Require 2FA for Admin Roles</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs">
                <span className="font-medium text-zinc-200">API Rate Limiting</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Strict (100 req/min)</span>
              </div>
            </div>
          </div>

          {/* System Environment Section */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
              <Sliders className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold text-white text-base">Environment & Maintenance</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Global system flags and operational mode settings.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs">
                <span className="font-medium text-zinc-200">System Maintenance Mode</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">Disabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs">
                <span className="font-medium text-zinc-200">New User Registration</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Open</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm mb-2">
            <Key className="h-4 w-4 text-red-500" />
            Super-Admin Configuration Sample Text
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Settings tab text sample. Changes made in this panel affect global platform defaults for all dealers, consumers, and administrators.
          </p>
        </div>
      </div>
    </SuperAdminShell>
  )
}
