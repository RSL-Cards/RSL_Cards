import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Switch, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_USER } from '../../src/constants/mockData'

const SPORTS = ['Football', 'Baseball', 'Basketball', 'Hockey', 'Soccer', 'MMA']

export default function SettingsScreen() {
  const router = useRouter()
  const [name, setName] = useState(MOCK_USER.name)
  const [email, setEmail] = useState(MOCK_USER.email)
  const [bio, setBio] = useState('Pro card dealer. Football & baseball specialist. Card shows every weekend.')
  const [selectedSports, setSelectedSports] = useState(MOCK_USER.dealer_profile.sports)

  const [notifications, setNotifications] = useState({
    sales: true,
    agingAlerts: true,
    priceAlerts: true,
    aiInsights: true,
    pushNotifs: true,
  })

  const toggleSport = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    )
  }

  const handleSave = () => {
    Alert.alert('Saved!', 'Your settings have been updated.')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile section */}
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <View style={styles.sectionCard}>
          {/* Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{MOCK_USER.initials}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{MOCK_USER.name}</Text>
              <Text style={{ color: '#888888', fontSize: 13, marginTop: 2 }}>{MOCK_USER.dealer_profile.subscription_plan.toUpperCase()} plan</Text>
            </View>
            <TouchableOpacity>
              <Text style={{ color: '#0057FF', fontSize: 13 }}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldDivider} />

          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput style={styles.fieldInput} value={name} onChangeText={setName} />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>EMAIL</Text>
          <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>BIO</Text>
          <TextInput
            style={[styles.fieldInput, { height: 80, paddingTop: 12, textAlignVertical: 'top' }]}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        {/* Sports preferences */}
        <Text style={styles.sectionLabel}>SPORTS PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <View style={styles.chipsGrid}>
            {SPORTS.map(sport => {
              const isSelected = selectedSports.includes(sport)
              return (
                <TouchableOpacity
                  key={sport}
                  style={[styles.sportChip, isSelected && styles.sportChipSelected]}
                  onPress={() => toggleSport(sport)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sportChipText, isSelected && styles.sportChipTextSelected]}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionLabel}>PAYMENT HANDLES</Text>
        <View style={styles.sectionCard}>
          {[
            { icon: '💜', label: 'Venmo',   placeholder: '@handle',      value: '@MikeSherrer' },
            { icon: '💚', label: 'CashApp', placeholder: '$cashtag',     value: '$MikeSherrer' },
            { icon: '💙', label: 'Zelle',   placeholder: 'Phone/Email',  value: 'mike@rslcards.com' },
            { icon: '🅿️', label: 'PayPal',  placeholder: 'Email',        value: '' },
          ].map((pm, i, arr) => (
            <View key={pm.label} style={[styles.paymentRow, i < arr.length - 1 && styles.rowBorder]}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>{pm.icon}</Text>
              <Text style={styles.paymentLabel}>{pm.label}</Text>
              <TextInput
                style={styles.paymentInput}
                defaultValue={pm.value}
                placeholder={pm.placeholder}
                placeholderTextColor="#555555"
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        {/* Notification toggles */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          {[
            { key: 'pushNotifs',  label: 'Push Notifications', sub: 'Receive alerts on this device' },
            { key: 'sales',       label: 'Sales Alerts',        sub: 'When a card sells on any platform' },
            { key: 'agingAlerts', label: 'Aging Alerts',        sub: 'Cards held 60+ days' },
            { key: 'priceAlerts', label: 'Price Alerts',        sub: 'When comp hits your target price' },
            { key: 'aiInsights',  label: 'AI Insights',         sub: 'Breakout player alerts' },
          ].map((item, i, arr) => (
            <View
              key={item.key}
              style={[styles.toggleRow, i < arr.length - 1 && styles.rowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Switch
                value={notifications[item.key as keyof typeof notifications]}
                onValueChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                trackColor={{ false: '#2A2A2A', true: '#E8001C' }}
                thumbColor="white"
              />
            </View>
          ))}
        </View>

        {/* Platform settings */}
        <Text style={styles.sectionLabel}>CONNECTED PLATFORMS</Text>
        <View style={styles.sectionCard}>
          {[
            { label: 'eBay',      status: 'Connected', statusColor: '#00C853', handle: 'MikeSherrer1987' },
            { label: 'Whatnot',   status: 'Connected', statusColor: '#00C853', handle: 'MikeSherrer' },
            { label: 'TCGPlayer', status: 'Not connected', statusColor: '#555555', handle: '' },
            { label: 'Shopify',   status: 'Not connected', statusColor: '#555555', handle: '' },
          ].map((p, i, arr) => (
            <TouchableOpacity
              key={p.label}
              style={[styles.toggleRow, i < arr.length - 1 && styles.rowBorder]}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>{p.label}</Text>
                {p.handle ? (
                  <Text style={styles.toggleSub}>{p.handle}</Text>
                ) : (
                  <Text style={[styles.toggleSub, { color: '#0057FF' }]}>Tap to connect</Text>
                )}
              </View>
              <Text style={[styles.statusText, { color: p.statusColor }]}>● {p.status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  sectionLabel: { color: '#555555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 4 },
  sectionCard: {
    backgroundColor: '#111111', borderRadius: 16, marginHorizontal: 20,
    marginBottom: 20, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', padding: 16,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8001C', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  fieldDivider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 16 },
  fieldLabel: { color: '#555555', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  fieldInput: {
    backgroundColor: '#1A1A1A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: 'white', fontSize: 15, borderWidth: 1, borderColor: '#2A2A2A',
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sportChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  sportChipSelected: { backgroundColor: '#E8001C', borderColor: '#E8001C' },
  sportChipText: { color: '#888888', fontSize: 13, fontWeight: '600' },
  sportChipTextSelected: { color: 'white' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  paymentLabel: { color: 'white', fontWeight: '600', fontSize: 14, width: 70 },
  paymentInput: { flex: 1, color: 'white', fontSize: 14, textAlign: 'right' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  toggleLabel: { color: 'white', fontSize: 15, fontWeight: '600' },
  toggleSub: { color: '#888888', fontSize: 12, marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  saveBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
