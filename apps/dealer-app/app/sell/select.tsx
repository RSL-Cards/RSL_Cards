import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { MOCK_INVENTORY } from '../../src/constants/mockData'

const STEP_PCT = '40%'

export default function SellSelectScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 2 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <Text style={styles.sectionTitle}>Select card to sell</Text>

      <FlashList
        data={MOCK_INVENTORY}
        {...{ estimatedItemSize: 90 } as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/sell/price')}
            activeOpacity={0.8}
          >
            <View style={styles.thumbPlaceholder}>
              <Text style={{ color: '#555555', fontSize: 14, fontWeight: '700' }}>
                {item.player_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardName}>{item.player_name}</Text>
              <Text style={styles.cardMeta}>{item.year} · {item.set_name} · {item.grade_key.replace('_', ' ')}</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                <Text style={{ color: '#888888', fontSize: 12 }}>Cost ${item.cost_basis}</Text>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Mkt ${item.current_market_value}</Text>
              </View>
            </View>
            <View style={[styles.gainPill, { backgroundColor: item.unrealized_gain >= 0 ? 'rgba(0,200,83,0.15)' : 'rgba(232,0,28,0.15)' }]}>
              <Text style={{ color: item.unrealized_gain >= 0 ? '#00C853' : '#E8001C', fontSize: 12, fontWeight: '700' }}>
                {item.unrealized_gain >= 0 ? '+' : ''}${item.unrealized_gain}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A', marginBottom: 16 },
  progressFill: { height: 3, backgroundColor: '#E8001C' },
  sectionTitle: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111',
    borderRadius: 16, marginHorizontal: 20, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  thumbPlaceholder: { width: 52, height: 72, backgroundColor: '#222222', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardName: { color: 'white', fontWeight: '700', fontSize: 15 },
  cardMeta: { color: '#888888', fontSize: 12, marginTop: 2 },
  gainPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
})
