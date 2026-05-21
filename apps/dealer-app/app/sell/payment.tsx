import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useDealTabStore } from '../../src/stores/dealTabStore'

const STEP_PCT = '80%'

const PAYMENT_METHODS = [
  { key: 'cash',    icon: 'cash-outline',              color: '#00C853', label: 'Cash',    lastUsed: false, digital: false },
  { key: 'venmo',   icon: 'wallet-outline',             color: '#008CFF', label: 'Venmo',   lastUsed: true,  digital: true  },
  { key: 'zelle',   icon: 'card-outline',               color: '#6C1CD1', label: 'Zelle',   lastUsed: false, digital: true  },
  { key: 'paypal',  icon: 'logo-paypal',                color: '#003087', label: 'PayPal',  lastUsed: false, digital: true  },
  { key: 'cashapp', icon: 'logo-usd',                   color: '#00D632', label: 'CashApp', lastUsed: false, digital: true  },
  { key: 'trade',   icon: 'swap-horizontal-outline',    color: '#888888', label: 'Trade',   lastUsed: false, digital: false },
  { key: 'other',   icon: 'card-outline',               color: '#888888', label: 'Other',   lastUsed: false, digital: false },
]

function MockQRCode() {
  const rows = Array.from({ length: 7 })
  const cells = Array.from({ length: 7 })
  return (
    <View style={styles.qrContainer}>
      <Text style={styles.qrLabel}>SCAN TO PAY</Text>
      <View style={styles.qrGrid}>
        {rows.map((_, r) =>
          cells.map((_, c) => (
            <View
              key={`${r}-${c}`}
              style={[
                styles.qrCell,
                { backgroundColor: (r + c) % 2 === 0 ? '#FFFFFF' : '#000000' },
              ]}
            />
          ))
        )}
      </View>
      <Text style={styles.qrSubLabel}>@MikeSherrer · $340</Text>
    </View>
  )
}

export default function SellPaymentScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [received, setReceived] = useState(false)
  const tabs = useDealTabStore((s) => s.tabs)
  const updateTab = useDealTabStore((s) => s.updateTab)
  const activeTab = tabs[tabs.length - 1]

  const isDigital = selected ? PAYMENT_METHODS.find(m => m.key === selected)?.digital : false

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 4 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Payment method</Text>

        <View style={styles.grid}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodCard, selected === m.key && styles.methodCardSelected]}
              onPress={() => {
                                setSelected(m.key)
                setReceived(false)
              }}
              activeOpacity={0.75}
            >
              {m.lastUsed && (
                <View style={styles.lastUsedBadge}>
                  <Text style={styles.lastUsedText}>Last used</Text>
                </View>
              )}
              <Ionicons name={m.icon as any} size={28} color={selected === m.key ? 'white' : m.color} style={{ marginBottom: 6 }} />
              <Text style={[styles.methodLabel, selected === m.key && { color: 'white' }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* QR code for digital payments */}
        {selected && isDigital && !received && (
          <View style={{ marginTop: 20 }}>
            <MockQRCode />
            <TouchableOpacity
              style={styles.receivedBtn}
              onPress={() => {
                                setReceived(true)
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>✓ Payment Received</Text>
            </TouchableOpacity>
          </View>
        )}

        {received && (
          <View style={styles.receivedConfirm}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>✅</Text>
            <Text style={{ color: '#00C853', fontWeight: '700', fontSize: 16 }}>Payment Confirmed!</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, (!selected) && styles.primaryBtnDisabled]}
          disabled={!selected}
          onPress={() => {
            if (activeTab?.id && selected) {
              updateTab(activeTab.id, { paymentMethod: selected })
            }
            router.push('/sell/confirm')
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>CONTINUE →</Text>
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
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A' },
  progressFill: { height: 3, backgroundColor: '#E8001C' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  methodCard: {
    width: '30%', aspectRatio: 1, backgroundColor: '#1A1A1A',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A2A', position: 'relative',
  },
  methodCardSelected: { borderWidth: 2, borderColor: '#E8001C', backgroundColor: 'rgba(232,0,28,0.1)' },
  lastUsedBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,200,83,0.2)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  lastUsedText: { color: '#00C853', fontSize: 8, fontWeight: '700' },
  methodLabel: { color: '#888888', fontSize: 13, fontWeight: '600' },
  qrContainer: { alignItems: 'center', backgroundColor: '#111111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A' },
  qrLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 140, height: 140 },
  qrCell: { width: 20, height: 20 },
  qrSubLabel: { color: '#888888', fontSize: 13, marginTop: 16 },
  receivedBtn: {
    marginTop: 12, backgroundColor: '#00C853', height: 48,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  receivedConfirm: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,83,0.1)',
    borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(0,200,83,0.3)',
  },
  bottomBar: { padding: 20, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  primaryBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { backgroundColor: '#1A1A1A' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
