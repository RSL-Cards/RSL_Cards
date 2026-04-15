import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

const METHODS = [
  { label: 'Card Shows', emoji: '🏪' },
  { label: 'eBay',       emoji: '🛒' },
  { label: 'Whatnot',    emoji: '📺' },
  { label: 'Facebook',   emoji: '📘' },
  { label: 'Mercari',    emoji: '🛍' },
  { label: 'COMC',       emoji: '🃏' },
  { label: 'TCGPlayer',  emoji: '🎮' },
  { label: 'Shopify',    emoji: '🏪' },
]

export default function SellMethodsScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (m: string) => {
    Haptics.selectionAsync()
    setSelected(prev => prev.includes(m) ? prev.filter(s => s !== m) : [...prev, m])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How do you sell?</Text>
        <Text style={styles.subtitle}>Select all channels you use</Text>

        <View style={styles.chipsGrid}>
          {METHODS.map(m => {
            const isSelected = selected.includes(m.label)
            return (
              <TouchableOpacity
                key={m.label}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggle(m.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipEmoji}>{m.emoji}</Text>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{m.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
          disabled={selected.length === 0}
          onPress={() => router.push('/(auth)/onboarding/payment-setup')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A', marginTop: 8 },
  progressFill: { width: '50%', height: 3, backgroundColor: '#E8001C' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '700', color: 'white' },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 8 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 32 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A1A1A', borderRadius: 100,
    paddingVertical: 12, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  chipSelected: { backgroundColor: '#E8001C', borderColor: '#E8001C' },
  chipEmoji: { fontSize: 18 },
  chipLabel: { color: '#888888', fontSize: 14, fontWeight: '600' },
  chipLabelSelected: { color: 'white' },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 32 },
  continueBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { backgroundColor: '#2A2A2A' },
  continueBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
