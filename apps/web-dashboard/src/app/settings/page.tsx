'use client'

import { useMemo, useState } from 'react'
import AccountSettingsSection from '@/components/settings/AccountSettingsSection'
import ConnectedPlatformsSection from '@/components/settings/ConnectedPlatformsSection'
import ListingDefaultsSection from '@/components/settings/ListingDefaultsSection'
import NotificationsSection from '@/components/settings/NotificationsSection'
import PaymentMethodsSection from '@/components/settings/PaymentMethodsSection'
import SettingsHeader from '@/components/settings/SettingsHeader'
import SettingsMetrics from '@/components/settings/SettingsMetrics'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import TeamAccessSection from '@/components/settings/TeamAccessSection'
import { SettingsSection, TeamRole } from '@/components/settings/settingsTypes'
import {
  initialTeamMembers,
  notificationDefaults,
  platformMeta,
  requestedPlatforms,
} from '@/components/settings/settingsUtils'
import Shell from '@/components/layout/Shell'
import {
  DEALER,
  INVENTORY_TABLE_DATA,
  PLATFORM_FEE_TABLE,
  RECENT_TRANSACTIONS,
} from '@/data/mockDashboard'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [account, setAccount] = useState({
    displayName: DEALER.dealer_profile.display_name,
    customUrl: DEALER.dealer_profile.custom_url,
    email: DEALER.email,
    supportEmail: 'support@rslcards.com',
    timezone: 'America/Chicago',
  })
  const [platformConnections, setPlatformConnections] = useState(() =>
    requestedPlatforms.reduce<Record<string, boolean>>((connections, platform) => {
      connections[platform] = platformMeta[platform]?.status === 'Connected'
      return connections
    }, {})
  )
  const [notifications, setNotifications] = useState(notificationDefaults)
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

  const paymentMethods = useMemo(() => {
    const payments = Array.from(new Set(RECENT_TRANSACTIONS.map((transaction) => transaction.payment)))
    return payments.map((payment, index) => ({
      id: payment.toLowerCase(),
      label: payment,
      usage: RECENT_TRANSACTIONS.filter((transaction) => transaction.payment === payment).length,
      default: index === 0,
      status: payment === 'eBay' ? 'Auto reconciled' : 'Ready',
    }))
  }, [])

  const connectedCount = Object.values(platformConnections).filter(Boolean).length
  const averagePlatformFee = Math.round(
    PLATFORM_FEE_TABLE.reduce((sum, platform) => sum + platform.fee_pct, 0) / PLATFORM_FEE_TABLE.length
  )
  const defaultPlatformFee =
    PLATFORM_FEE_TABLE.find((platform) => platform.platform === listingDefaults.platform)?.fee_pct ?? 0
  const inventoryReadyToList = INVENTORY_TABLE_DATA.filter((card) => card.status === 'unlisted').length

  const togglePlatform = (platform: string) => {
    setPlatformConnections((current) => ({ ...current, [platform]: !current[platform] }))
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

  const saveSettings = () => {
    setSaveMessage('Settings saved locally for this dashboard session.')
    window.setTimeout(() => setSaveMessage(''), 2500)
  }

  return (
    <Shell>
      <div className="space-y-6">
        <SettingsHeader saveMessage={saveMessage} onSave={saveSettings} />

        <SettingsMetrics
          averagePlatformFee={averagePlatformFee}
          connectedCount={connectedCount}
          defaultPlatformFee={defaultPlatformFee}
          inventoryReadyToList={inventoryReadyToList}
          paymentMethodCount={paymentMethods.length}
          platformCount={requestedPlatforms.length}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div className="space-y-6 xl:col-span-3">
            {activeSection === 'account' && (
              <AccountSettingsSection
                account={account}
                onAccountChange={setAccount}
              />
            )}

            {activeSection === 'platforms' && (
              <ConnectedPlatformsSection
                platformConnections={platformConnections}
                onTogglePlatform={togglePlatform}
              />
            )}

            {activeSection === 'payments' && (
              <PaymentMethodsSection paymentMethods={paymentMethods} />
            )}

            {activeSection === 'notifications' && (
              <NotificationsSection
                notifications={notifications}
                onToggleNotification={toggleNotification}
              />
            )}

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
          </div>
        </div>
      </div>
    </Shell>
  )
}
