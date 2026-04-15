import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { MOCK_CARD_SEARCH_RESULTS } from '../../src/constants/mockData'
import { useDealTabStore } from '../../src/stores/dealTabStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
type Tab = 'scan' | 'barcode' | 'search'

const STEP_PCT = '20%'

export default function BuyScanScreen() {
  const router = useRouter()
  const addTab = useDealTabStore(s => s.addTab)
  const [activeTab, setActiveTab] = useState<Tab>('scan')
  const [query, setQuery] = useState('')

  const filtered = MOCK_CARD_SEARCH_RESULTS.filter(c =>
    c.player_name.toLowerCase().includes(query.toLowerCase()) ||
    c.set_name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSimulateScan = () => {
        const card = MOCK_CARD_SEARCH_RESULTS[0]
    addTab({ type: 'buy', step: 2, cardData: card })
    router.push('/buy/comps')
  }

  const handleSelectCard = (card: typeof MOCK_CARD_SEARCH_RESULTS[0]) => {
        addTab({ type: 'buy', step: 2, cardData: card })
    router.push('/buy/comps')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 1 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['scan', 'barcode', 'search'] as Tab[]).map(t => (
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
            {/* Corner brackets */}
            {[
              { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
              { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
              { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
              { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner as any]} />
            ))}
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={{ color: '#888888', fontSize: 14 }}>Point at card front</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSimulateScan} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Simulate Card Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BARCODE tab */}
      {activeTab === 'barcode' && (
        <View style={styles.scanContent}>
          <View style={[styles.cameraArea, { aspectRatio: 2 }]}>
            {[
              { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
              { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
              { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
              { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner as any]} />
            ))}
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
            <Text style={{ color: '#888888', fontSize: 14 }}>Point at barcode / cert #</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSimulateScan} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Simulate Barcode Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEARCH tab */}
      {activeTab === 'search' && (
        <View style={{ flex: 1, paddingTop: 16 }}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search player, year, set..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
          <FlashList
            data={filtered}
            {...{ estimatedItemSize: 64 } as any}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.searchResultRow}
                onPress={() => handleSelectCard(item)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultName}>{item.player_name}</Text>
                  <Text style={styles.searchResultMeta}>{item.year} · {item.set_name}{item.variation ? ` · ${item.variation}` : ''}</Text>
                </View>
                <View style={styles.sportChip}>
                  <Text style={styles.sportChipText}>{item.sport}</Text>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#888888', fontSize: 20 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A' },
  progressFill: { height: 3, backgroundColor: '#0057FF' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#0057FF' },
  tabText: { color: '#555555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: 'white', fontWeight: '700' },
  scanContent: { flex: 1, paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' },
  cameraArea: {
    width: '100%', aspectRatio: 1, backgroundColor: '#0D0D0D',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 24,
  },
  corner: {
    position: 'absolute', width: 20, height: 20, borderColor: 'white',
  },
  primaryBtn: {
    backgroundColor: '#0057FF', height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 20,
    paddingHorizontal: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A',
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: 'white', fontSize: 15 },
  searchResultRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  searchResultName: { color: 'white', fontWeight: '600', fontSize: 15 },
  searchResultMeta: { color: '#888888', fontSize: 12, marginTop: 2 },
  sportChip: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  sportChipText: { color: '#888888', fontSize: 11, fontWeight: '600' },
})
