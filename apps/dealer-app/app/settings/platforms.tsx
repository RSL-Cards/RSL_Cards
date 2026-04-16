import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { ScrollView } from 'react-native'

const PLATFORMS = [
  { key: 'ebay',      label: 'eBay',      icon: '🛒', status: 'connected',     handle: 'MikeSherrer1987', color: '#0057FF' },
  { key: 'whatnot',   label: 'Whatnot',   icon: '📺', status: 'connected',     handle: 'MikeSherrer',    color: '#9B59B6' },
  { key: 'tcgplayer', label: 'TCGPlayer', icon: '🎮', status: 'disconnected',  handle: '',               color: '#00C853' },
  { key: 'shopify',   label: 'Shopify',   icon: '🏪', status: 'disconnected',  handle: '',               color: '#96BF48' },
  { key: 'facebook',  label: 'Facebook',  icon: '📘', status: 'disconnected',  handle: '',               color: '#1877F2' },
  { key: 'mercari',   label: 'Mercari',   icon: '🛍',  status: 'disconnected',  handle: '',               color: '#FF4F4F' },
]

export default function PlatformsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Platforms</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
        <Text style={styles.description}>
          Connect your selling platforms to sync listings, track fees, and get notified when cards sell.
        </Text>

        <View style={styles.platformList}>
          {PLATFORMS.map((p, i) => {
            const isConnected = p.status === 'connected'
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.platformRow, i < PLATFORMS.length - 1 && styles.rowBorder]}
                onPress={() => Alert.alert(
                  isConnected ? `Disconnect ${p.label}?` : `Connect ${p.label}`,
                  isConnected
                    ? `This will disconnect your ${p.label} account.`
                    : `You will be redirected to ${p.label} to authorize RSL Cards.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: isConnected ? 'Disconnect' : 'Connect', style: isConnected ? 'destructive' : 'default' },
                  ]
                )}
                activeOpacity={0.7}
              >
                <View style={[styles.platformIcon, { backgroundColor: `${p.color}22` }]}>
                  <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.platformName}>{p.label}</Text>
                  {isConnected ? (
                    <Text style={styles.platformHandle}>{p.handle}</Text>
                  ) : (
                    <Text style={styles.platformNotConnected}>Not connected</Text>
                  )}
                </View>
                <View style={[styles.statusPill, { backgroundColor: isConnected ? 'rgba(0,200,83,0.15)' : '#1A1A1A' }]}>
                  <Text style={[styles.statusPillText, { color: isConnected ? '#00C853' : '#555555' }]}>
                    {isConnected ? '● Connected' : 'Connect'}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  description: { color: '#888888', fontSize: 13, lineHeight: 20, paddingHorizontal: 20, marginBottom: 20 },
  platformList: {
    marginHorizontal: 20, backgroundColor: '#111111',
    borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden',
  },
  platformRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  platformIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  platformName: { color: 'white', fontWeight: '700', fontSize: 15 },
  platformHandle: { color: '#888888', fontSize: 13, marginTop: 2 },
  platformNotConnected: { color: '#555555', fontSize: 12, marginTop: 2 },
  statusPill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
})
