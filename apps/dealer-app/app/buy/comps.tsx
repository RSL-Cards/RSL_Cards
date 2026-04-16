import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_COMPS } from '../../src/constants/mockData'
import { format } from 'date-fns'

const STEP_PCT = '40%'

function DealRatingBadge({ rating }: { rating: string }) {
  const configs: Record<string, { bg: string; label: string; icon: string }> = {
    good_deal:  { bg: '#00C853', label: 'GOOD DEAL',  icon: '✓' },
    great_deal: { bg: '#00C853', label: 'GREAT DEAL', icon: '🔥' },
    fair_price: { bg: '#FFB300', label: 'FAIR PRICE', icon: '↔' },
    overpaying: { bg: '#E8001C', label: 'OVERPAYING', icon: '⚠' },
  }
  const cfg = configs[rating] || configs.fair_price
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <View style={{ backgroundColor: cfg.bg, borderRadius: 100, paddingHorizontal: 28, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{cfg.icon}</Text>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>{cfg.label}</Text>
      </View>
      <Text style={{ color: '#888888', fontSize: 13, marginTop: 8 }}>Buying at 83% of comp</Text>
    </View>
  )
}

export default function BuyCompsScreen() {
  const router = useRouter()
  const maxSparkline = Math.max(...MOCK_COMPS.sparkline_data)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 2 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Card identity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 }}>
          <View style={styles.cardThumb}>
            <Text style={{ color: '#555555', fontSize: 18, fontWeight: '700' }}>PM</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{MOCK_COMPS.card_name}</Text>
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>{MOCK_COMPS.grade_key.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        {/* Avg comp hero */}
        <View style={styles.avgBox}>
          <Text style={styles.avgLabel}>AVG LAST 30 DAYS</Text>
          <Text style={styles.avgValue}>${MOCK_COMPS.avg_sold_30d.toFixed(2)}</Text>
          <Text style={{ color: '#00C853', fontSize: 14, fontWeight: '700', marginTop: 4 }}>
            ↑ {MOCK_COMPS.price_trend_30d}% vs prev month
          </Text>
        </View>

        {/* Sparkline */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={styles.sectionLabel}>30-DAY TREND</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60, marginTop: 10 }}>
            {MOCK_COMPS.sparkline_data.map((v, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: '100%',
                  height: Math.max((v / maxSparkline) * 50, 4),
                  backgroundColor: i === MOCK_COMPS.sparkline_data.length - 1 ? '#00C853' : '#0057FF',
                  borderRadius: 3,
                }} />
              </View>
            ))}
          </View>
        </View>

        {/* Deal rating */}
        <DealRatingBadge rating="good_deal" />

        {/* Recent sales */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.sectionLabel}>RECENT SALES</Text>
          <View style={styles.sectionCard}>
            {MOCK_COMPS.last_five_sold.map((sale, i) => (
              <View
                key={i}
                style={[styles.saleRow, i < MOCK_COMPS.last_five_sold.length - 1 && styles.rowBorder]}
              >
                <Text style={styles.salePrice}>${sale.sold_price.toFixed(2)}</Text>
                <View style={[styles.platformChip, { backgroundColor: sale.platform === 'Whatnot' ? 'rgba(120,0,255,0.2)' : 'rgba(0,87,255,0.15)' }]}>
                  <Text style={[styles.platformChipText, { color: sale.platform === 'Whatnot' ? '#9B59B6' : '#0057FF' }]}>
                    {sale.platform}
                  </Text>
                </View>
                <Text style={styles.saleDate}>{format(new Date(sale.sold_at), 'MMM d')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cross-platform prices */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={styles.sectionLabel}>LISTED ON OTHER PLATFORMS</Text>
          <View style={styles.sectionCard}>
            {MOCK_COMPS.by_platform.map((p, i) => {
              const diff = p.avg_sold - MOCK_COMPS.avg_sold_30d
              return (
                <View
                  key={p.platform}
                  style={[styles.saleRow, i < MOCK_COMPS.by_platform.length - 1 && styles.rowBorder]}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, flex: 1 }}>{p.platform}</Text>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 15, marginRight: 10 }}>
                    ${p.avg_sold.toFixed(0)}
                  </Text>
                  <Text style={{ color: diff >= 0 ? '#00C853' : '#E8001C', fontSize: 12, fontWeight: '700' }}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(0)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* AI Narrative */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={styles.aiCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
              <Text style={{ color: '#E8001C', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>AI SIGNAL</Text>
            </View>
            <Text style={{ color: '#888888', fontSize: 13, lineHeight: 20 }}>{MOCK_COMPS.ai_narrative}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/buy/price')} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>ENTER PRICE →</Text>
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
  cardThumb: { width: 60, height: 80, backgroundColor: '#222222', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardName: { color: 'white', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  gradePill: { backgroundColor: '#FFD700', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  gradePillText: { color: '#000', fontSize: 11, fontWeight: '700' },
  avgBox: {
    marginHorizontal: 20, backgroundColor: '#111111', borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16,
  },
  avgLabel: { color: '#555555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  avgValue: { color: 'white', fontSize: 36, fontWeight: '900' },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  sectionCard: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  saleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, justifyContent: 'space-between' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  salePrice: { color: 'white', fontWeight: '700', fontSize: 15, flex: 1 },
  platformChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 10 },
  platformChipText: { fontSize: 11, fontWeight: '700' },
  saleDate: { color: '#555555', fontSize: 12 },
  aiCard: { backgroundColor: '#111111', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#E8001C', borderWidth: 1, borderColor: '#2A2A2A' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  primaryBtn: { backgroundColor: '#0057FF', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
