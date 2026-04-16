import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_INVENTORY } from '../../src/constants/mockData'

const PLATFORMS = [
  { key: 'ebay',      label: 'eBay',      feePct: 0.1285, flatFee: 5,  color: '#0057FF' },
  { key: 'whatnot',   label: 'Whatnot',   feePct: 0.08,   flatFee: 5,  color: '#9B59B6' },
  { key: 'tcgplayer', label: 'TCGPlayer', feePct: 0.1025, flatFee: 5,  color: '#00C853' },
  { key: 'shopify',   label: 'Shopify',   feePct: 0.02,   flatFee: 0,  color: '#96BF48' },
]

export default function CreateListingScreen() {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<typeof MOCK_INVENTORY[0] | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [price, setPrice] = useState('')

  const numPrice = parseFloat(price) || 0

  const platformData = PLATFORMS.map(p => {
    const fee = numPrice * p.feePct
    const net = numPrice - fee - p.flatFee
    return { ...p, fee, net }
  }).sort((a, b) => b.net - a.net)

  const togglePlatform = (key: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const autoTitle = selectedCard
    ? `${selectedCard.year} ${selectedCard.set_name} ${selectedCard.player_name}${selectedCard.variation ? ` ${selectedCard.variation}` : ''} ${selectedCard.grade_key.replace('_', ' ')}`
    : ''

  const handlePublish = () => {
    Alert.alert('Listed!', 'Your card has been listed successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List a Card</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Card selector */}
        <Text style={styles.sectionLabel}>SELECT CARD</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 8 }}
        >
          {MOCK_INVENTORY.filter(i => i.status !== 'listed').map(card => (
            <TouchableOpacity
              key={card.id}
              style={[styles.cardChip, selectedCard?.id === card.id && styles.cardChipSelected]}
              onPress={() => setSelectedCard(card)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardChipName, selectedCard?.id === card.id && { color: 'white' }]} numberOfLines={1}>
                {card.player_name}
              </Text>
              <Text style={[styles.cardChipMeta, selectedCard?.id === card.id && { color: 'rgba(255,255,255,0.6)' }]}>
                {card.grade_key.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Auto-title preview */}
        {autoTitle.length > 0 && (
          <View style={styles.titlePreview}>
            <Text style={styles.sectionLabel}>AUTO-GENERATED TITLE</Text>
            <Text style={styles.titlePreviewText}>{autoTitle}</Text>
          </View>
        )}

        {/* Platform selector */}
        <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }]}>
          PLATFORMS
        </Text>
        <View style={styles.platformGrid}>
          {PLATFORMS.map(p => {
            const isSelected = selectedPlatforms.includes(p.key)
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.platformChip, isSelected && { borderColor: p.color, backgroundColor: `${p.color}18` }]}
                onPress={() => togglePlatform(p.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.platformChipText, isSelected && { color: p.color }]}>{p.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Price input */}
        <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }]}>
          YOUR PRICE
        </Text>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.priceDollar}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#2A2A2A"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Fee comparison table */}
        {numPrice > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>FEE COMPARISON</Text>
            <View style={styles.feeTable}>
              {platformData.map((p, i) => {
                const isBest = i === 0
                return (
                  <View
                    key={p.key}
                    style={[
                      styles.feeRow,
                      i < platformData.length - 1 && styles.feeRowBorder,
                      isBest && styles.feeRowBest,
                    ]}
                  >
                    {isBest && (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestBadgeText}>BEST</Text>
                      </View>
                    )}
                    <Text style={[styles.feePlatform, isBest && { color: 'white' }]}>{p.label}</Text>
                    <Text style={styles.feeAmount}>-${p.fee.toFixed(2)}</Text>
                    <Text style={[styles.feeNet, isBest && { color: '#00C853' }]}>${p.net.toFixed(2)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Publish button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.publishBtn, (!selectedCard || !price || selectedPlatforms.length === 0) && styles.publishBtnDisabled]}
          disabled={!selectedCard || !price || selectedPlatforms.length === 0}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Text style={styles.publishBtnText}>
            Publish on {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}` : 'platforms'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A', borderRadius: 18 },
  closeBtnText: { color: '#888888', fontSize: 16 },
  sectionLabel: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 10 },
  cardChip: {
    width: 120, backgroundColor: '#111111', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  cardChipSelected: { backgroundColor: '#0057FF', borderColor: '#0057FF' },
  cardChipName: { color: '#888888', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardChipMeta: { color: '#555555', fontSize: 11 },
  titlePreview: { marginHorizontal: 20, marginTop: 12, backgroundColor: '#111111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A2A2A' },
  titlePreviewText: { color: 'white', fontSize: 13, lineHeight: 18 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  platformChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#111111', borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  platformChipText: { color: '#888888', fontSize: 14, fontWeight: '600' },
  priceInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, backgroundColor: '#111111',
    borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A',
    paddingHorizontal: 20,
  },
  priceDollar: { color: '#555555', fontSize: 32, fontWeight: '700', marginRight: 4 },
  priceInput: { flex: 1, color: 'white', fontSize: 40, fontWeight: '900', paddingVertical: 16 },
  feeTable: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  feeRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  feeRowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  feeRowBest: { borderLeftWidth: 3, borderLeftColor: '#00C853' },
  bestBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  bestBadgeText: { color: '#FFD700', fontSize: 9, fontWeight: '700' },
  feePlatform: { flex: 1, color: '#888888', fontSize: 14, fontWeight: '600' },
  feeAmount: { color: '#E8001C', fontSize: 13, marginRight: 12 },
  feeNet: { color: 'white', fontSize: 15, fontWeight: '700', minWidth: 64, textAlign: 'right' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  publishBtn: { backgroundColor: '#0057FF', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  publishBtnDisabled: { backgroundColor: '#1A1A1A' },
  publishBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
