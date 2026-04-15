import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { MOCK_LISTINGS } from '../../src/constants/mockData'
import { format } from 'date-fns'

const PLATFORMS = ['All', 'eBay', 'Whatnot', 'TCGPlayer', 'Shopify']

const PLATFORM_COLORS: Record<string, string> = {
  eBay:      '#0057FF',
  Whatnot:   '#9B59B6',
  TCGPlayer: '#00C853',
  Shopify:   '#96BF48',
}

export default function ListingsScreen() {
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState('All')

  const filtered = selectedPlatform === 'All'
    ? MOCK_LISTINGS
    : MOCK_LISTINGS.filter(l => l.platform === selectedPlatform)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/listings/create')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Platform filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 8 }}
      >
        {PLATFORMS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, selectedPlatform === p && styles.filterChipActive]}
            onPress={() => setSelectedPlatform(p)}
          >
            <Text style={[styles.filterChipText, selectedPlatform === p && styles.filterChipTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      <FlashList
        data={filtered}
        {...{ estimatedItemSize: 130 } as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => {
          const platformColor = PLATFORM_COLORS[item.platform] || '#888888'
          return (
            <View style={styles.listingCard}>
              {/* Row 1 */}
              <View style={styles.row}>
                <Text style={styles.playerName} numberOfLines={1}>{item.player_name}</Text>
                <View style={[styles.platformBadge, { backgroundColor: `${platformColor}22` }]}>
                  <Text style={[styles.platformBadgeText, { color: platformColor }]}>{item.platform}</Text>
                </View>
              </View>

              {/* Row 2 - price breakdown */}
              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceBlockLabel}>LIST</Text>
                  <Text style={styles.priceBlockValue}>${item.list_price.toLocaleString()}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceBlockLabel}>FEE</Text>
                  <Text style={[styles.priceBlockValue, { color: '#E8001C' }]}>-${item.platform_fee_amt.toFixed(2)}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceBlockLabel}>NET</Text>
                  <Text style={[styles.priceBlockValue, { color: '#00C853' }]}>${item.net_to_dealer.toFixed(2)}</Text>
                </View>
              </View>

              {/* Row 3 - status */}
              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>● Active</Text>
                </View>
                <Text style={styles.metaText}>
                  Listed {format(new Date(item.listed_at), 'MMM d')} · {item.views} views · {item.watchers} watchers
                </Text>
                <TouchableOpacity style={styles.menuBtn}>
                  <Text style={styles.menuBtnText}>···</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first listing</Text>
          </View>
        }
      />
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: 'white' },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#0057FF',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: 'white', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100,
    backgroundColor: '#111111', borderWidth: 1, borderColor: '#2A2A2A',
  },
  filterChipActive: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  filterChipText: { color: '#888888', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: 'white' },
  listingCard: {
    backgroundColor: '#111111', borderRadius: 16, marginHorizontal: 20,
    marginBottom: 10, padding: 16, borderWidth: 1, borderColor: '#2A2A2A',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  playerName: { flex: 1, color: 'white', fontWeight: '700', fontSize: 16 },
  platformBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  platformBadgeText: { fontSize: 12, fontWeight: '700' },
  priceBlock: { flex: 1 },
  priceBlockLabel: { color: '#555555', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  priceBlockValue: { color: 'white', fontSize: 15, fontWeight: '700' },
  activeBadge: { backgroundColor: 'rgba(0,200,83,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 10 },
  activeBadgeText: { color: '#00C853', fontSize: 12, fontWeight: '700' },
  metaText: { flex: 1, color: '#555555', fontSize: 11 },
  menuBtn: { padding: 4 },
  menuBtnText: { color: '#888888', fontSize: 18, letterSpacing: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: '#888888', fontSize: 14, marginTop: 6 },
})
