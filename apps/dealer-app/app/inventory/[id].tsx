import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MOCK_INVENTORY, MOCK_COMPS } from '../../src/constants/mockData'
import { format } from 'date-fns'

function GradeChip({ gradeKey }: { gradeKey: string }) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    PSA_10: { bg: '#FFD700', color: '#000000', label: 'PSA 10' },
    PSA_9:  { bg: '#1A1A1A', color: '#FFD700', label: 'PSA 9' },
    BGS_9:  { bg: '#0057FF', color: '#FFFFFF', label: 'BGS 9' },
    RAW:    { bg: '#2A2A2A', color: '#888888', label: 'RAW' },
  }
  const cfg = configs[gradeKey] || { bg: '#2A2A2A', color: '#888888', label: gradeKey }
  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: cfg.color, fontSize: 13, fontWeight: '700' }}>{cfg.label}</Text>
    </View>
  )
}

export default function CardDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const card = MOCK_INVENTORY.find(c => c.id === id) || MOCK_INVENTORY[0]
  const initials = card.player_name.split(' ').map(w => w[0]).join('').slice(0, 2)

  const stats = [
    { label: 'Cost Basis',      value: `$${card.cost_basis.toFixed(2)}`,            color: '#888888' },
    { label: 'Market Value',    value: `$${card.current_market_value.toFixed(2)}`,  color: 'white' },
    { label: 'Days Held',       value: `${card.days_held} days`,                    color: card.days_held >= 60 ? '#FFB300' : 'white' },
    {
      label: 'Unrealized',
      value: `${card.unrealized_gain >= 0 ? '+' : ''}$${card.unrealized_gain.toFixed(2)} (${card.unrealized_gain_pct >= 0 ? '+' : ''}${card.unrealized_gain_pct}%)`,
      color: card.unrealized_gain >= 0 ? '#00C853' : '#E8001C',
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Card Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card image */}
        <View style={styles.imageArea}>
          <Text style={styles.imageInitials}>{initials}</Text>
          {card.cert_number && (
            <View style={styles.certBadge}>
              <Text style={styles.certText}>#{card.cert_number}</Text>
            </View>
          )}
        </View>

        {/* Player info */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, alignItems: 'center' }}>
          <Text style={styles.playerName}>{card.player_name}</Text>
          <Text style={styles.cardSubtitle}>{card.year} · {card.set_name}{card.variation ? ` · ${card.variation}` : ''}</Text>
          <GradeChip gradeKey={card.grade_key} />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Last 5 sales */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={styles.sectionLabel}>RECENT SALES (eBay)</Text>
          <View style={styles.sectionCard}>
            {MOCK_COMPS.last_five_sold.map((sale, i) => (
              <View
                key={i}
                style={[styles.saleRow, i < MOCK_COMPS.last_five_sold.length - 1 && styles.saleRowBorder]}
              >
                <Text style={styles.salePrice}>${sale.sold_price.toFixed(2)}</Text>
                <View style={[styles.platformBadge, { backgroundColor: sale.platform === 'Whatnot' ? 'rgba(120,0,255,0.2)' : 'rgba(0,87,255,0.15)' }]}>
                  <Text style={[styles.platformBadgeText, { color: sale.platform === 'Whatnot' ? '#9B59B6' : '#0057FF' }]}>
                    {sale.platform}
                  </Text>
                </View>
                <Text style={styles.saleDate}>
                  {format(new Date(sale.sold_at), 'MMM d')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cross-platform prices */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={styles.sectionLabel}>PLATFORM PRICES</Text>
          <View style={styles.sectionCard}>
            {MOCK_COMPS.by_platform.map((p, i) => (
              <View
                key={p.platform}
                style={[styles.platformRow, i < MOCK_COMPS.by_platform.length - 1 && styles.saleRowBorder]}
              >
                <Text style={styles.platformName}>{p.platform}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.platformAvg}>Avg ${p.avg_sold.toFixed(0)}</Text>
                  <Text style={styles.platformLowest}>Lowest ${p.lowest_active.toFixed(0)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Narrative */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={styles.aiCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
              <Text style={{ color: '#E8001C', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>AI INSIGHT</Text>
            </View>
            <Text style={{ color: '#888888', fontSize: 13, lineHeight: 20 }}>
              {MOCK_COMPS.ai_narrative}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.listBtn}
          onPress={() => router.push('/listings/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.listBtnText}>List for Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push('/sell/scan')}
          activeOpacity={0.85}
        >
          <Text style={styles.sellBtnText}>Quick Sell</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '600' },
  imageArea: {
    height: 280, marginHorizontal: 20, backgroundColor: '#111111',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  imageInitials: { color: '#2A2A2A', fontSize: 64, fontWeight: '900' },
  certBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  certText: { color: '#555555', fontSize: 11 },
  playerName: { fontSize: 26, fontWeight: '700', color: 'white', marginBottom: 6, textAlign: 'center' },
  cardSubtitle: { color: '#888888', fontSize: 14, marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 20, marginTop: 24,
  },
  statCell: {
    width: '47%', backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#2A2A2A',
  },
  statLabel: { color: '#555555', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '700' },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  sectionCard: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  saleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, justifyContent: 'space-between' },
  saleRowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  salePrice: { color: 'white', fontWeight: '700', fontSize: 15, flex: 1 },
  platformBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 12 },
  platformBadgeText: { fontSize: 11, fontWeight: '700' },
  saleDate: { color: '#555555', fontSize: 12 },
  platformRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  platformName: { color: 'white', fontWeight: '600', fontSize: 14 },
  platformAvg: { color: 'white', fontSize: 14, fontWeight: '700' },
  platformLowest: { color: '#888888', fontSize: 11, marginTop: 2 },
  aiCard: {
    backgroundColor: '#111111', borderRadius: 16, padding: 16,
    borderLeftWidth: 3, borderLeftColor: '#E8001C',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 20,
    backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A',
  },
  listBtn: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#0057FF',
    alignItems: 'center', justifyContent: 'center',
  },
  listBtnText: { color: '#0057FF', fontWeight: '700', fontSize: 15 },
  sellBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: '#E8001C',
    alignItems: 'center', justifyContent: 'center',
  },
  sellBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
})
