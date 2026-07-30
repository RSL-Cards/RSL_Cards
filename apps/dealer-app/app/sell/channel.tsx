import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useDealTabStore } from '../../src/stores/dealTabStore'

const STEP_PCT = '40%'

const CHANNELS = [
  { key: 'card_show', icon: 'people-outline', color: '#0057FF', label: 'Card Show', sub: 'In-person event' },
  { key: 'ebay', icon: 'logo-paypal', color: '#0053A0', label: 'eBay', sub: 'Online auction' },
  { key: 'myslabs', icon: 'cube-outline', color: '#E8001C', label: 'MySlabs', sub: 'Slab marketplace' },
  { key: 'facebook', icon: 'logo-facebook', color: '#1877F2', label: 'Facebook', sub: 'Groups / Marketplace' },
  { key: 'local_store', icon: 'storefront-outline', color: '#00C853', label: 'Local Store', sub: 'Retail location' },
  { key: 'other', icon: 'ellipsis-horizontal-circle-outline', color: '#888888', label: 'Other', sub: 'Private sale' },
]

export default function SellChannelScreen() {
  const router = useRouter()
  const tabs = useDealTabStore((s) => s.tabs)
  const updateTab = useDealTabStore((s) => s.updateTab)
  const activeTab = tabs[tabs.length - 1]
  
  // Default selected channel if none provided yet
  const [selected, setSelected] = useState<string | null>(activeTab?.channel || null)

  const handleContinue = () => {
    if (activeTab?.id && selected) {
      updateTab(activeTab.id, { channel: selected })
    }
    router.push('/sell/price')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Channel</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Where did you sell it?</Text>

        <FlatList
          data={CHANNELS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.channelCard, selected === item.key && styles.channelCardSelected]}
              onPress={() => setSelected(item.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, selected === item.key ? { backgroundColor: item.color } : { backgroundColor: '#1A1A1A' }]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={selected === item.key ? 'white' : item.color} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.channelLabel}>{item.label}</Text>
                <Text style={styles.channelSub}>{item.sub}</Text>
              </View>
              {selected === item.key && (
                <Ionicons name="checkmark-circle" size={24} color={item.color} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, (!selected) && styles.primaryBtnDisabled]}
          disabled={!selected}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>CONTINUE →</Text>
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  channelCardSelected: {
    borderColor: '#E8001C',
    backgroundColor: 'rgba(232,0,28,0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: { color: 'white', fontSize: 16, fontWeight: '600' },
  channelSub: { color: '#888888', fontSize: 13, marginTop: 4 },
  bottomBar: { padding: 20, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  primaryBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { backgroundColor: '#1A1A1A' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
