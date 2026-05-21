import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useDealTabStore } from '../../src/stores/dealTabStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const STEP_PCT = '60%'

const QUICK_PRICES = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 1000]

export default function SellPriceScreen() {
  const router = useRouter()
  const [priceInput, setPriceInput] = useState<string>("")
  const selectedPrice = priceInput ? parseInt(priceInput, 10) || null : null
  const tabs = useDealTabStore((s) => s.tabs)
  const updateTab = useDealTabStore((s) => s.updateTab)
  const activeTab = tabs[tabs.length - 1]
  const card = activeTab?.cardData

  const costBasis = parseFloat(card?.cost_basis ?? card?.costBasis ?? '0')
  const avgComp = parseFloat(card?.current_market_value ?? card?.currentMarketValue ?? '0')

  const profit = selectedPrice ? selectedPrice - costBasis : null
  const profitPct = profit && costBasis > 0 ? Math.round((profit / costBasis) * 100) : null

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 3 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}>
        {/* Comp reference */}
        <View style={{ alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          {avgComp > 0 && (
            <View style={styles.compPill}>
              <Text style={styles.compPillText}>Market: ${avgComp.toFixed(0)}</Text>
            </View>
          )}
          <View style={[styles.compPill, { borderColor: '#2A2A2A' }]}>
            <Text style={styles.compPillText}>Cost: ${costBasis.toFixed(0)}</Text>
          </View>
        </View>

        {/* Selected / Custom price input */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.selectedPriceDisplay, { marginRight: 2, color: priceInput ? 'white' : '#555' }]}>$</Text>
            <TextInput
              style={[styles.selectedPriceDisplay, { minWidth: 60 }]}
              placeholder="0"
              placeholderTextColor="#555555"
              keyboardType="number-pad"
              value={priceInput}
              onChangeText={setPriceInput}
              maxLength={6}
              autoFocus
            />
          </View>
          {profit != null && (
            <View style={[styles.profitPill, { backgroundColor: profit >= 0 ? 'rgba(0,200,83,0.15)' : 'rgba(232,0,28,0.15)', marginTop: 8 }]}>
              <Text style={{ color: profit >= 0 ? '#00C853' : '#E8001C', fontSize: 18, fontWeight: '900' }}>
                {profit >= 0 ? '+' : ''}${profit} ({profitPct}%)
              </Text>
            </View>
          )}
        </View>

        {/* Quick price grid */}
        <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginBottom: 12 }]}>QUICK SELECT</Text>
        <View style={styles.priceGrid}>
          {QUICK_PRICES.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priceChip,
                selectedPrice === p && styles.priceChipSelected,
                { width: (SCREEN_WIDTH - 56) / 3 },
              ]}
              onPress={() => setPriceInput(selectedPrice === p ? "" : p.toString())}
              activeOpacity={0.75}
            >
              <Text style={[styles.priceChipText, selectedPrice === p && styles.priceChipTextSelected]}>
                ${p}
              </Text>
              {p > costBasis && (
                <Text style={{ color: selectedPrice === p ? 'rgba(255,255,255,0.6)' : '#00C853', fontSize: 10, marginTop: 2 }}>
                  +${p - costBasis}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, !selectedPrice && styles.primaryBtnDisabled]}
          disabled={!selectedPrice}
          onPress={() => {
            if (activeTab?.id && selectedPrice) {
              updateTab(activeTab.id, { price: selectedPrice, avgComp: avgComp || undefined })
            }
            router.push('/sell/payment')
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            SET PRICE ${selectedPrice || '—'} →
          </Text>
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
  compPill: { backgroundColor: '#1A1A1A', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  compPillText: { color: '#888888', fontSize: 13, fontWeight: '600' },
  selectedPriceDisplay: { color: 'white', fontSize: 52, fontWeight: '900', marginBottom: 8 },
  profitPill: { borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8 },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  priceChip: { height: 60, backgroundColor: '#1A1A1A', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  priceChipSelected: { backgroundColor: '#E8001C', borderColor: '#E8001C' },
  priceChipText: { color: '#888888', fontSize: 16, fontWeight: '700' },
  priceChipTextSelected: { color: 'white' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  primaryBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { backgroundColor: '#1A1A1A' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
