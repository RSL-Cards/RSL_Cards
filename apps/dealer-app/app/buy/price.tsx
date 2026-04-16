import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_COMPS } from '../../src/constants/mockData'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const STEP_PCT = '60%'

const QUICK_PRICES = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 1000]
const PCT_OFFERS = [50, 60, 70, 80, 90, 100]

function DealRatingBadge({ pct }: { pct: number }) {
  if (pct <= 60) return (
    <View style={[styles.ratingBadge, { backgroundColor: '#00C853' }]}>
      <Text style={styles.ratingText}>🔥 GREAT DEAL</Text>
    </View>
  )
  if (pct <= 75) return (
    <View style={[styles.ratingBadge, { backgroundColor: '#00C853' }]}>
      <Text style={styles.ratingText}>✓ GOOD DEAL</Text>
    </View>
  )
  if (pct <= 90) return (
    <View style={[styles.ratingBadge, { backgroundColor: '#FFB300' }]}>
      <Text style={styles.ratingText}>↔ FAIR PRICE</Text>
    </View>
  )
  return (
    <View style={[styles.ratingBadge, { backgroundColor: '#E8001C' }]}>
      <Text style={styles.ratingText}>⚠ OVERPAYING</Text>
    </View>
  )
}

export default function BuyPriceScreen() {
  const router = useRouter()
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const avgComp = MOCK_COMPS.avg_sold_30d

  const pctOfComp = selectedPrice ? Math.round((selectedPrice / avgComp) * 100) : null

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 3 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}>
        {/* Comp reference */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.compPill}>
            <Text style={styles.compPillText}>Avg comp: ${avgComp.toFixed(0)}</Text>
          </View>
        </View>

        {/* Selected price display */}
        {selectedPrice && (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.selectedPriceDisplay}>${selectedPrice}</Text>
            {pctOfComp && <Text style={{ color: '#888888', fontSize: 14, marginTop: 4 }}>{pctOfComp}% of comp</Text>}
          </View>
        )}

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
              onPress={() => setSelectedPrice(selectedPrice === p ? null : p)}
              activeOpacity={0.75}
            >
              <Text style={[styles.priceChipText, selectedPrice === p && styles.priceChipTextSelected]}>
                ${p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* % of comp */}
        <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }]}>
          % OF COMP
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {PCT_OFFERS.map(pct => {
            const price = Math.round((pct / 100) * avgComp)
            const isSelected = selectedPrice === price
            return (
              <TouchableOpacity
                key={pct}
                style={[styles.pctChip, isSelected && styles.pctChipSelected]}
                onPress={() => setSelectedPrice(isSelected ? null : price)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pctLabel, isSelected && { color: 'white' }]}>{pct}%</Text>
                <Text style={[styles.pctPrice, isSelected && { color: 'white' }]}>${price}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Deal rating */}
        {pctOfComp != null && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <DealRatingBadge pct={pctOfComp} />
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, !selectedPrice && styles.primaryBtnDisabled]}
          disabled={!selectedPrice}
          onPress={() => router.push('/buy/payment')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            CONFIRM ${selectedPrice || '—'} →
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
  progressFill: { height: 3, backgroundColor: '#0057FF' },
  compPill: {
    backgroundColor: '#1A1A1A', borderRadius: 100,
    paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  compPillText: { color: '#888888', fontSize: 14, fontWeight: '600' },
  selectedPriceDisplay: { color: 'white', fontSize: 52, fontWeight: '900' },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  priceChip: {
    height: 52, backgroundColor: '#1A1A1A', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  priceChipSelected: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  priceChipText: { color: '#888888', fontSize: 16, fontWeight: '700' },
  priceChipTextSelected: { color: 'white' },
  pctChip: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12,
    alignItems: 'center', minWidth: 72,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  pctChipSelected: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  pctLabel: { color: '#888888', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  pctPrice: { color: '#555555', fontSize: 14, fontWeight: '700' },
  ratingBadge: { borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center' },
  ratingText: { color: 'white', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  primaryBtn: { backgroundColor: '#0057FF', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { backgroundColor: '#1A1A1A' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
