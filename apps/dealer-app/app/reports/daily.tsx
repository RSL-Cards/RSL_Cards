import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_TODAY_STATS, MOCK_TRANSACTIONS } from '../../src/constants/mockData'
import { format } from 'date-fns'

export default function DailyReportScreen() {
  const router = useRouter()

  const margin = Math.round((MOCK_TODAY_STATS.net_profit / MOCK_TODAY_STATS.total_revenue) * 100)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Daily Report</Text>
          <Text style={styles.headerDate}>{format(new Date(MOCK_TODAY_STATS.date), 'EEEE, MMM d, yyyy')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero metric */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>NET PROFIT TODAY</Text>
          <Text style={styles.heroValue}>${MOCK_TODAY_STATS.net_profit}</Text>
          <Text style={styles.heroMargin}>{margin}% margin</Text>
        </View>

        {/* Stat grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Bought',  value: `${MOCK_TODAY_STATS.cards_bought} cards`, color: '#0057FF' },
            { label: 'Sold',    value: `${MOCK_TODAY_STATS.cards_sold} cards`,   color: '#E8001C' },
            { label: 'Spent',   value: `$${MOCK_TODAY_STATS.total_spent}`,       color: '#888888' },
            { label: 'Revenue', value: `$${MOCK_TODAY_STATS.total_revenue}`,     color: 'white' },
          ].map(s => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Best deal */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={styles.sectionLabel}>BEST DEAL</Text>
          <View style={styles.bestDealCard}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Jayden Daniels Raw</Text>
              <Text style={{ color: '#888888', fontSize: 13, marginTop: 2 }}>Prizm Silver · Bought $35 → Sold $58</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#00C853', fontWeight: '900', fontSize: 22 }}>+$23</Text>
              <Text style={{ color: '#00C853', fontSize: 13, fontWeight: '700' }}>65.7%</Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={styles.sectionLabel}>ALL TRANSACTIONS</Text>
          <View style={styles.txCard}>
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <View
                key={tx.id}
                style={[styles.txRow, i < MOCK_TRANSACTIONS.length - 1 && styles.txRowBorder]}
              >
                <View style={[styles.typeBadge, {
                  backgroundColor: tx.type === 'buy' ? 'rgba(0,87,255,0.15)' : 'rgba(232,0,28,0.15)',
                }]}>
                  <Text style={[styles.typeBadgeText, {
                    color: tx.type === 'buy' ? '#0057FF' : '#E8001C',
                  }]}>
                    {tx.type.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.txName}>{tx.player_name}</Text>
                  <Text style={styles.txMeta}>{tx.payment_method} · {format(new Date(tx.created_at), 'h:mm a')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.txPrice}>${tx.price}</Text>
                  {tx.profit != null && (
                    <Text style={{ color: '#00C853', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                      +${tx.profit}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Channel breakdown */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={styles.sectionLabel}>BY CHANNEL</Text>
          <View style={styles.txCard}>
            <View style={[styles.txRow, styles.txRowBorder]}>
              <Text style={{ flex: 1, color: 'white', fontWeight: '600', fontSize: 15 }}>Card Show</Text>
              <Text style={{ color: '#00C853', fontWeight: '700', fontSize: 15 }}>$890</Text>
            </View>
            <View style={styles.txRow}>
              <Text style={{ flex: 1, color: '#888888', fontSize: 15 }}>eBay</Text>
              <Text style={{ color: '#888888', fontSize: 15 }}>$0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  headerDate: { color: '#888888', fontSize: 12, textAlign: 'center', marginTop: 2 },
  heroCard: {
    marginHorizontal: 20, marginTop: 8, backgroundColor: '#111111',
    borderRadius: 20, padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2A2A', borderTopWidth: 3, borderTopColor: '#00C853',
  },
  heroLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  heroValue: { color: '#00C853', fontSize: 52, fontWeight: '900' },
  heroMargin: { color: '#888888', fontSize: 16, marginTop: 6 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 20, marginTop: 14,
  },
  statCell: {
    width: '47%', backgroundColor: '#111111', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#2A2A2A',
  },
  statLabel: { color: '#555555', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700' },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  bestDealCard: {
    backgroundColor: '#111111', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2A2A', borderLeftWidth: 3, borderLeftColor: '#FFD700',
  },
  txCard: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 44, alignItems: 'center' },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  txName: { color: 'white', fontWeight: '600', fontSize: 14 },
  txMeta: { color: '#555555', fontSize: 11, marginTop: 2 },
  txPrice: { color: 'white', fontWeight: '700', fontSize: 14 },
})
