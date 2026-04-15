import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { MOCK_INVENTORY } from '../../src/constants/mockData'
import { useDealTabStore } from '../../src/stores/dealTabStore'

type Tab = 'scan' | 'search'
const STEP_PCT = '20%'

export default function SellScanScreen() {
  const router = useRouter()
  const addTab = useDealTabStore(s => s.addTab)
  const [activeTab, setActiveTab] = useState<Tab>('scan')
  const [query, setQuery] = useState('')

  const filtered = MOCK_INVENTORY.filter(c =>
    c.player_name.toLowerCase().includes(query.toLowerCase()) ||
    c.set_name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSimulateScan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const card = MOCK_INVENTORY[0]
    addTab({ type: 'sell', step: 2, cardData: card })
    router.push('/sell/select')
  }

  const handleSelectCard = (card: typeof MOCK_INVENTORY[0]) => {
    Haptics.selectionAsync()
    addTab({ type: 'sell', step: 2, cardData: card })
    router.push('/sell/price')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 1 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['scan', 'search'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SCAN tab */}
      {activeTab === 'scan' && (
        <View style={styles.scanContent}>
          <View style={styles.cameraArea}>
            {[
              { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
              { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
              { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
              { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner as any]} />
            ))}
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={{ color: '#888888', fontSize: 14 }}>Scan card or cert number</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSimulateScan} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Simulate Card Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEARCH tab — shows inventory */}
      {activeTab === 'search' && (
        <View style={{ flex: 1, paddingTop: 16 }}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your inventory..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
          <Text style={{ color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 8 }}>
            YOUR INVENTORY
          </Text>
          <FlashList
            data={filtered}
            {...{ estimatedItemSize: 72 } as any}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.inventoryRow}
                onPress={() => handleSelectCard(item)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.invName}>{item.player_name}</Text>
                  <Text style={styles.invMeta}>{item.year} · {item.set_name} · {item.grade_key.replace('_', ' ')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                    ${item.current_market_value}
                  </Text>
                  <Text style={{ color: '#888888', fontSize: 11, marginTop: 2 }}>cost ${item.cost_basis}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#888888', fontSize: 20 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A' },
  progressFill: { height: 3, backgroundColor: '#E8001C' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#E8001C' },
  tabText: { color: '#555555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: 'white', fontWeight: '700' },
  scanContent: { flex: 1, paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' },
  cameraArea: {
    width: '100%', aspectRatio: 1, backgroundColor: '#0D0D0D',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 24,
  },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: 'white' },
  primaryBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 20,
    paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A',
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: 'white', fontSize: 15 },
  inventoryRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  invName: { color: 'white', fontWeight: '600', fontSize: 15 },
  invMeta: { color: '#888888', fontSize: 12, marginTop: 2 },
})
