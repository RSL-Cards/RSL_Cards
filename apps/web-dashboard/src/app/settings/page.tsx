'use client'

import { useEffect, useState } from 'react'
import AccountSettingsSection from '@/components/settings/AccountSettingsSection'
import ConnectedPlatformsSection, { AVAILABLE_PLATFORMS } from '@/components/settings/ConnectedPlatformsSection'
import ListingDefaultsSection from '@/components/settings/ListingDefaultsSection'
import NotificationsSection from '@/components/settings/NotificationsSection'
import PaymentMethodsSection from '@/components/settings/PaymentMethodsSection'
import SettingsHeader from '@/components/settings/SettingsHeader'
import SettingsMetrics from '@/components/settings/SettingsMetrics'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import TeamAccessSection from '@/components/settings/TeamAccessSection'
import { SettingsSection, TeamRole, AccountSettings } from '@/components/settings/settingsTypes'
import {
  initialTeamMembers,
  notificationDefaults,
  requestedPlatforms,
} from '@/components/settings/settingsUtils'
import { useSettingsStore } from '@/stores/settingStore'
import Shell from '@/components/layout/Shell'
import { useDashboardInventoryCounts } from '@/hooks/dashboard/useDashboard'
import {
  INVENTORY_TABLE_DATA,
  PLATFORM_FEE_TABLE,
} from '@/data/mockDashboard'

export default function SettingsPage() {
  const {
    profile,
    paymentMethods,
    connectedPlatforms,

    fetchProfile,
    fetchPaymentMethods,
    fetchConnectedPlatforms,

    updateProfile,
    disconnectPlatform,
    uploadAvatar,
  } = useSettingsStore()
  const { data: countsData } = useDashboardInventoryCounts()
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [account, setAccount] = useState<AccountSettings>({
    displayName: '',
    customUrl: '',
    email: '',
    photoUrl: '',
    sports: [],
    paymentMethods: [
      { type: 'venmo', handle: '' },
      { type: 'cashapp', handle: '' },
      { type: 'zelle', handle: '' },
      { type: 'paypal', handle: '' },
    ],
  })

  useEffect(() => {
    if (!profile) return

    setAccount({
      displayName: profile.displayName ?? '',
      customUrl: profile.customUrl ?? '',
      email: profile.email ?? '',
      photoUrl: profile.photoUrl ?? '',
      sports: profile.sports ?? [],
      paymentMethods: profile.paymentMethods ?? [
        { type: 'venmo', handle: '' },
        { type: 'cashapp', handle: '' },
        { type: 'zelle', handle: '' },
        { type: 'paypal', handle: '' },
      ],
    })
  }, [profile])
  // const [account, setAccount] = useState({
  //   displayName: DEALER.dealer_profile.display_name,
  //   customUrl: DEALER.dealer_profile.custom_url,
  //   email: DEALER.email,
  //   supportEmail: 'support@rslcards.com',
  //   timezone: 'America/Chicago',
  // })
  // const [platformConnections, setPlatformConnections] = useState(() =>
  //   requestedPlatforms.reduce<Record<string, boolean>>((connections, platform) => {
  //     connections[platform] = platformMeta[platform]?.status === 'Connected'
  //     return connections
  //   }, {})
  // )
  const [notifications, setNotifications] = useState(notificationDefaults)

  // Map profile.notificationPreferences to the notifications array when profile loads
  useEffect(() => {
    if (profile?.notificationPreferences) {
      setNotifications((current) => current.map(notif => {
        if (notif.id === 'daily_log_push') {
          const pushVal = (profile.notificationPreferences as any)?.dailyLogs?.push ?? (profile.notificationPreferences as any)?.notify_daily_close_push ?? true;
          return { ...notif, enabled: Boolean(pushVal) };
        }
        if (notif.id === 'daily_log_email') {
          const emailVal = (profile.notificationPreferences as any)?.dailyLogs?.email ?? (profile.notificationPreferences as any)?.notify_daily_close_email ?? true;
          return { ...notif, enabled: Boolean(emailVal) };
        }

        const prefKey = notif.id === 'price_spikes' ? 'priceSpikes' :
                        notif.id === 'aging_inventory' ? 'inventoryAging' :
                        notif.id === 'failed_sync' ? 'failedSync' :
                        notif.id === 'new_sales' ? 'newSales' :
                        notif.id === 'weekly_report' ? 'weeklyReport' : null;
        
        if (prefKey && profile.notificationPreferences) {
          const pref = (profile.notificationPreferences as any)[prefKey];
          if (pref) {
            return { ...notif, enabled: Boolean(pref.push || pref.email) };
          }
        }
        return notif;
      }));
    }
  }, [profile?.notificationPreferences]);
  const [listingDefaults, setListingDefaults] = useState({
    platform: 'eBay',
    pricingMode: 'Auto optimize by platform fees',
    markup: '8',
    handlingDays: '2',
    shippingProfile: 'Buyer paid tracked shipping',
    returnPolicy: '30 day returns',
    autoRelist: true,
    autoTitle: true,
    crossPost: true,
    description:
      'Card condition and grade are verified by RSL Cards. Market comps are reviewed before listing.',
  })
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('Lister')
  const [saveMessage, setSaveMessage] = useState('')

  // const paymentMethods = useMemo(() => {
  //   const payments = Array.from(new Set(RECENT_TRANSACTIONS.map((transaction) => transaction.payment)))
  //   return payments.map((payment, index) => ({
  //     id: payment.toLowerCase(),
  //     label: payment,
  //     usage: RECENT_TRANSACTIONS.filter((transaction) => transaction.payment === payment).length,
  //     default: index === 0,
  //     status: payment === 'eBay' ? 'Auto reconciled' : 'Ready',
  //   }))
  // }, [])

  const connectedCount =
    connectedPlatforms.filter(
      (platform) => platform.isActive,
    ).length
  const averagePlatformFee = Math.round(
    PLATFORM_FEE_TABLE.reduce((sum, platform) => sum + platform.fee_pct, 0) / PLATFORM_FEE_TABLE.length
  )
  const defaultPlatformFee =
    PLATFORM_FEE_TABLE.find((platform) => platform.platform === listingDefaults.platform)?.fee_pct ?? 0
  const inventoryReadyToList = countsData?.unlistedCards ?? 0

  const [showEbayModal, setShowEbayModal] = useState(false)

  const handleEbayOAuth = () => {
    const EBAY_AUTH_URL = process.env.NEXT_PUBLIC_EBAY_AUTH_URL || 'https://auth.ebay.com/oauth2/authorize'
    const EBAY_CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
    const EBAY_RU_NAME = process.env.NEXT_PUBLIC_EBAY_RU_NAME

    if (!EBAY_CLIENT_ID || !EBAY_RU_NAME) {
      setSaveMessage('eBay environment variables not configured.')
      window.setTimeout(() => setSaveMessage(''), 2500)
      return
    }

    const returnUrl = window.location.origin + '/settings'
    const stateStr = profile?.id ? `${profile.id}___${returnUrl}` : ''
    const scope = encodeURIComponent('https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account')
    const authUrl = `${EBAY_AUTH_URL}?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${EBAY_RU_NAME}&scope=${scope}&state=${encodeURIComponent(stateStr)}`

    window.location.href = authUrl
  }

  const handleConnectPlatform = (platform: string) => {
    if (platform === 'ebay') {
      setShowEbayModal(true)
    }
  }

  const handleDisconnectPlatform = async (platform: string) => {
    try {
      await disconnectPlatform(platform.toLowerCase())
      await fetchConnectedPlatforms()
      setSaveMessage(`${platform} disconnected successfully.`)
      window.setTimeout(() => setSaveMessage(''), 2500)
    } catch (error) {
      console.error(error)
      setSaveMessage(`Failed to disconnect ${platform}.`)
      window.setTimeout(() => setSaveMessage(''), 2500)
    }
  }

  const toggleNotification = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    )
  }

  const inviteTeamMember = () => {
    if (!inviteEmail.trim()) return

    setTeamMembers((current) => [
      ...current,
      {
        id: `team-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Pending',
      },
    ])
    setInviteEmail('')
  }

  const saveSettings = async () => {
    try {
      const notificationPreferences = {
        priceSpikes: { 
          push: notifications.find(n => n.id === 'price_spikes')?.enabled ?? true,
          email: notifications.find(n => n.id === 'price_spikes')?.enabled ?? true,
        },
        inventoryAging: {
          push: false, // UI says Email only
          email: notifications.find(n => n.id === 'aging_inventory')?.enabled ?? true,
        },
        failedSync: {
          push: notifications.find(n => n.id === 'failed_sync')?.enabled ?? true,
          email: false, // UI says Push only
        },
        newSales: {
          push: notifications.find(n => n.id === 'new_sales')?.enabled ?? true,
          email: notifications.find(n => n.id === 'new_sales')?.enabled ?? true,
        },
        weeklyReport: {
          push: false, // UI says Email only
          email: notifications.find(n => n.id === 'weekly_report')?.enabled ?? false,
        },
        dailyLogs: {
          push: notifications.find(n => n.id === 'daily_log_push')?.enabled ?? true,
          email: notifications.find(n => n.id === 'daily_log_email')?.enabled ?? true,
        },
      };

      await updateProfile({
        displayName: account.displayName,
        customUrl: account.customUrl,
        sports: account.sports,
        paymentMethods: account.paymentMethods.filter(pm => pm.handle.trim() !== ''),
        notificationPreferences,
      })

      setSaveMessage('Profile updated successfully.')
      window.setTimeout(() => setSaveMessage(''), 2500)
    } catch {
      setSaveMessage('Failed to update profile.')
      window.setTimeout(() => setSaveMessage(''), 2500)
    }
  }
  useEffect(() => {
    fetchProfile()
    fetchPaymentMethods()
    fetchConnectedPlatforms()
  }, [
    fetchProfile,
    fetchPaymentMethods,
    fetchConnectedPlatforms,
  ])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const status = params.get('status')
      const message = params.get('message')

      if (status === 'success') {
        setActiveSection('platforms')
        setSaveMessage('Platform connected successfully!')
        window.setTimeout(() => setSaveMessage(''), 3000)
        window.history.replaceState({}, '', window.location.pathname)
      } else if (status === 'error') {
        setActiveSection('platforms')
        setSaveMessage(message ? decodeURIComponent(message) : 'Failed to connect platform.')
        window.setTimeout(() => setSaveMessage(''), 4000)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const formattedPaymentMethods =
    paymentMethods.map((method) => ({
      id: method.id,
      label: method.type,
      usage: 0,
      default: method.isDefault,
      status: 'Connected',
    }))
  return (
    <Shell>
      <div className="space-y-6">
        <SettingsHeader saveMessage={saveMessage} onSave={saveSettings} />

        {/* Phase 1: Commented out summary metrics cards on Settings page
        <SettingsMetrics
          averagePlatformFee={averagePlatformFee}
          connectedCount={connectedCount}
          defaultPlatformFee={defaultPlatformFee}
          inventoryReadyToList={inventoryReadyToList}
          paymentMethodCount={paymentMethods.length}
          platformCount={AVAILABLE_PLATFORMS.length}
        />
        */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div className="space-y-6 xl:col-span-3">
            {activeSection === 'account' && (
              <AccountSettingsSection
                account={account}
                profileId={profile?.id}
                onAccountChange={setAccount}
                onUploadAvatar={uploadAvatar}
              />
            )}

            {activeSection === 'platforms' && (
              <ConnectedPlatformsSection
                platforms={connectedPlatforms}
                onConnectPlatform={handleConnectPlatform}
                onDisconnectPlatform={handleDisconnectPlatform}
              />
            )}

            {activeSection === 'payments' && (
              <PaymentMethodsSection
                paymentMethods={account.paymentMethods}
                onChange={(paymentMethods) => setAccount({ ...account, paymentMethods })}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationsSection
                notifications={notifications}
                onToggleNotification={toggleNotification}
              />
            )}

            {/* Phase 1: Commented out Listing Defaults and Team Access sections
            {activeSection === 'listings' && (
              <ListingDefaultsSection
                defaultPlatformFee={defaultPlatformFee}
                listingDefaults={listingDefaults}
                onListingDefaultsChange={setListingDefaults}
              />
            )}

            {activeSection === 'team' && (
              <TeamAccessSection
                inviteEmail={inviteEmail}
                inviteRole={inviteRole}
                teamMembers={teamMembers}
                onInviteEmailChange={setInviteEmail}
                onInviteRoleChange={setInviteRole}
                onInviteTeamMember={inviteTeamMember}
                onTeamMembersChange={setTeamMembers}
              />
            )}
            */}
          </div>
        </div>
      </div>

      {/* eBay Connection Features Modal */}
      {showEbayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xl font-bold">
                🛍️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">eBay Integration</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    🛠️ Under Active Development
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Coming Soon</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              We are actively developing native eBay integration! The following features will take place shortly:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <span className="text-xl">📦</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Automatic Inventory Sync</h4>
                  <p className="text-xs text-zinc-400">Imports & syncs active eBay listings into RSL Card inventory.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <span className="text-xl">📊</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Market Comps</h4>
                  <p className="text-xs text-zinc-400">Fetches live eBay active & sold price comps for accurate valuation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">One-Click Cross-Posting</h4>
                  <p className="text-xs text-zinc-400">Instantly publish inventory items directly to your eBay store.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <span className="text-xl">💰</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Automated Sales & P&L Log</h4>
                  <p className="text-xs text-zinc-400">Automatically tracks completed eBay sales in your daily log.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowEbayModal(false)}
                className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
