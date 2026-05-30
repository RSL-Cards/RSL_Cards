import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { MOCK_CUSTOMERS } from '../../src/constants/mockData'
import { formatDistanceToNow } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'

const AVATAR_COLORS: Record<string, string> = {
  A: '#0057FF', B: '#0057FF', C: '#0057FF', D: '#0057FF', E: '#0057FF',
  F: '#E8001C', G: '#E8001C', H: '#E8001C', I: '#E8001C', J: '#E8001C',
  K: '#00C853', L: '#00C853', M: '#00C853', N: '#00C853', O: '#00C853', P: '#00C853',
  Q: '#FFB300', R: '#FFB300', S: '#FFB300', T: '#FFB300', U: '#FFB300',
  V: '#FFB300', W: '#FFB300', X: '#FFB300', Y: '#FFB300', Z: '#FFB300',
}

export default function CustomersScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  )

  const avatarColor = (name: string) => AVATAR_COLORS[name[0].toUpperCase()] || '#888888'

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('New Customer', 'Add customer flow coming soon!')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#888888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#555555"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { label: 'TOTAL', value: `${MOCK_CUSTOMERS.length}`, color: 'white' },
          { label: 'REVENUE', value: `$${MOCK_CUSTOMERS.reduce((s, c) => s + c.total_spent, 0).toLocaleString()}`, color: '#00C853' },
          { label: 'FAVORITES', value: `${MOCK_CUSTOMERS.filter(c => c.is_favorite).length}`, color: '#FFD700' },
        ].map(s => (
          <View key={s.label} style={styles.statCell}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Customer list */}
      <FlashList
        data={filtered}
        {...{ estimatedItemSize: 88 } as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.customerCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert(item.name, item.notes || 'No notes')}
          >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.customerName}>{item.name}</Text>
                {item.is_favorite && <Ionicons name="star" size={14} color="#FFD700" />}
              </View>
              <Text style={styles.customerMeta}>
                Last seen {formatDistanceToNow(new Date(item.last_seen_at), { addSuffix: true })}
              </Text>
              <Text style={styles.customerStats}>
                {item.total_transactions} transactions · ${item.total_spent.toLocaleString()} total
              </Text>
            </View>

            {/* Chevron */}
            <Text style={{ color: '#2A2A2A', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
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
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 20,
    paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 46, color: 'white', fontSize: 15 },
  statsStrip: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#111111', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#555555', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  customerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111111', borderRadius: 16, marginHorizontal: 20,
    marginBottom: 10, padding: 14, borderWidth: 1, borderColor: '#2A2A2A',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '700' },
  customerName: { color: 'white', fontWeight: '700', fontSize: 15 },
  customerMeta: { color: '#555555', fontSize: 12, marginTop: 2 },
  customerStats: { color: '#888888', fontSize: 12, marginTop: 2 },
})
