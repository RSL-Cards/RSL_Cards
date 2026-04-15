import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MOCK_COMPS } from '../../src/constants/mockData'

const STEP_PCT = '100%'

export default function BuyConfirmScreen() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.3))[0]

  useEffect(() => {
    if (confirmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start()
      setTimeout(() => router.replace('/(tabs)/inventory'), 1800)
    }
  }, [confirmed])

  if (confirmed) {
    return (
      <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={{ color: 'white', fontSize: 60, lineHeight: 70 }}>✓</Text>
        </Animated.View>
        <Text style={styles.successTitle}>Card Added!</Text>
        <Text style={styles.successSub}>Inventory Updated</Text>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 5 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardThumb}>
            <Text style={{ color: '#555555', fontSize: 24, fontWeight: '900' }}>PM</Text>
          </View>
          <Text style={styles.cardName}>{MOCK_COMPS.card_name}</Text>
          <View style={styles.gradePill}>
            <Text style={styles.gradePillText}>PSA 10</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.priceLabel}>PURCHASE PRICE</Text>
          <Text style={styles.priceValue}>$280</Text>

          <View style={styles.methodRow}>
            <Text style={{ fontSize: 20 }}>💜</Text>
            <Text style={styles.methodText}>Venmo · @seller</Text>
          </View>

          <View style={styles.dealBadge}>
            <Text style={styles.dealBadgeText}>✓ GOOD DEAL — 83% of comp</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Confirm */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => setConfirmed(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>CONFIRM PURCHASE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 16 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#555555', fontSize: 14 }}>Cancel</Text>
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
  summaryCard: {
    backgroundColor: '#111111', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center',
  },
  cardThumb: {
    width: 80, height: 110, backgroundColor: '#222222',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cardName: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  gradePill: { backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  gradePillText: { color: '#000', fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#2A2A2A', width: '100%', marginVertical: 20 },
  priceLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  priceValue: { color: 'white', fontSize: 48, fontWeight: '900', marginBottom: 16 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  methodText: { color: '#888888', fontSize: 15 },
  dealBadge: {
    backgroundColor: 'rgba(0,200,83,0.15)', borderRadius: 100,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(0,200,83,0.3)',
  },
  dealBadgeText: { color: '#00C853', fontSize: 13, fontWeight: '700' },
  confirmBtn: {
    backgroundColor: '#0057FF', height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnText: { color: 'white', fontWeight: '700', fontSize: 17, letterSpacing: 0.5 },
  successOverlay: {
    flex: 1, backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center',
  },
  successCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#00C853',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { color: 'white', fontSize: 28, fontWeight: '700' },
  successSub: { color: '#888888', fontSize: 16, marginTop: 8 },
})
