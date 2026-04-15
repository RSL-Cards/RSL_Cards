import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { MOCK_USER } from '../../src/constants/mockData'

function SettingsRow({
  icon, label, value, onPress, isLast, accentColor,
}: {
  icon: string; label: string; value?: string; onPress?: () => void; isLast?: boolean; accentColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress || (() => Alert.alert('Coming Soon', 'This feature is coming soon!'))}
      activeOpacity={0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, accentColor && { color: accentColor }]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {!accentColor && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>
}

export default function MoreScreen() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome') } },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{MOCK_USER.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.profileName}>{MOCK_USER.name}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>{MOCK_USER.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Text style={{ color: '#FFD700', fontSize: 12 }}>★</Text>
              <Text style={{ color: '#888888', fontSize: 12 }}>{MOCK_USER.dealer_profile.rating} · {MOCK_USER.dealer_profile.review_count} reviews</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings/index')}>
            <Text style={{ color: '#0057FF', fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Business */}
        <Text style={styles.sectionLabel}>BUSINESS</Text>
        <SectionCard>
          <SettingsRow icon="👥" label="Customers" onPress={() => router.push('/customers/index')} />
          <SettingsRow icon="📅" label="Card Shows" />
          <SettingsRow icon="📋" label="My Listings" onPress={() => router.push('/listings/index')} isLast />
        </SectionCard>

        {/* Platforms */}
        <Text style={styles.sectionLabel}>PLATFORMS</Text>
        <SectionCard>
          <SettingsRow icon="🛒" label="eBay" value="🟢 MikeSherrer1987" />
          <SettingsRow icon="📺" label="Whatnot" value="🟢 Connected" />
          <SettingsRow icon="🎮" label="TCGPlayer" value="⚫ Not connected" />
          <SettingsRow icon="🏪" label="Shopify" value="⚫ Not connected" isLast />
        </SectionCard>

        {/* Payments */}
        <Text style={styles.sectionLabel}>PAYMENTS</Text>
        <SectionCard>
          <SettingsRow icon="💜" label="Venmo" value="@MikeSherrer" />
          <SettingsRow icon="💚" label="CashApp" value="$MikeSherrer" />
          <SettingsRow icon="💙" label="Zelle" value="mike@rslcards.com" isLast />
        </SectionCard>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA & EXPORTS</Text>
        <SectionCard>
          <SettingsRow icon="📄" label="Export Transactions (CSV)" />
          <SettingsRow icon="📦" label="Export Inventory (CSV)" />
          <SettingsRow icon="💰" label="Tax Report (PDF)" isLast />
        </SectionCard>

        {/* App */}
        <Text style={styles.sectionLabel}>APP</Text>
        <SectionCard>
          <SettingsRow icon="🔔" label="Notifications" onPress={() => router.push('/settings/index')} />
          <SettingsRow icon="❓" label="Help & Support" />
          <SettingsRow icon="ℹ️" label="About RSL Cards" />
          <SettingsRow icon="📱" label="Version" value="1.0.0" isLast />
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: 'white' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111111', borderRadius: 16, padding: 16,
    marginHorizontal: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2A',
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8001C',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  profileName: { color: 'white', fontSize: 16, fontWeight: '700' },
  profileEmail: { color: '#888888', fontSize: 13, marginTop: 2 },
  proBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)',
  },
  proBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  sectionLabel: {
    color: '#555555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    paddingHorizontal: 20, marginBottom: 8, marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#111111', borderRadius: 16, marginHorizontal: 20,
    marginBottom: 20, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  rowIcon: { fontSize: 18, marginRight: 12, width: 26 },
  rowLabel: { color: 'white', fontSize: 15, fontWeight: '500', flex: 1 },
  rowValue: { color: '#888888', fontSize: 13, marginRight: 8 },
  chevron: { color: '#2A2A2A', fontSize: 20 },
  logoutBtn: {
    marginHorizontal: 20, backgroundColor: '#111111', borderRadius: 16,
    height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  logoutText: { color: '#E8001C', fontSize: 16, fontWeight: '700' },
})
