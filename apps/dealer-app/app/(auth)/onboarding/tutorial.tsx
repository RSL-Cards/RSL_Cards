import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const SLIDES = [
  {
    bg: '#0057FF',
    iconText: 'BUY',
    title: 'Tap BUY when you purchase a card',
    subtitle: 'At a show, scan or search, enter price, done in 10 seconds',
  },
  {
    bg: '#E8001C',
    iconText: 'SELL',
    title: 'Tap SELL when you make a sale',
    subtitle: 'Profit calculated instantly, QR code for digital payment',
  },
  {
    bg: '#00C853',
    iconName: 'bar-chart-outline',
    title: 'Track everything in Reports',
    subtitle: 'Daily, weekly, monthly profit — always know your numbers',
  },
]

export default function TutorialScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    setCurrentSlide(idx)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>Here's how RSL Cards works</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ marginTop: 32 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.heroCircle, { backgroundColor: slide.bg }]}>
              {slide.iconName ? (
                <Ionicons name={slide.iconName as any} size={42} color="white" />
              ) : (
                <Text style={styles.heroText}>{slide.iconText}</Text>
              )}
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.bottomSection}>
        {currentSlide === SLIDES.length - 1 ? (
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started!</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              const next = currentSlide + 1
              scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true })
              setCurrentSlide(next)
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  progressBar: { height: 3, backgroundColor: '#1A1A1A', marginTop: 8 },
  progressFill: { width: '100%', height: 3, backgroundColor: '#E8001C' },
  title: { fontSize: 26, fontWeight: '700', color: 'white', textAlign: 'center' },
  subtitle: { color: '#888888', fontSize: 14, textAlign: 'center', marginTop: 8 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  heroCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  heroText: { fontSize: 36, fontWeight: '900', fontStyle: 'italic', color: 'white' },
  slideTitle: { color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  slideSubtitle: { color: '#888888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A2A2A' },
  dotActive: { backgroundColor: 'white', width: 24 },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 32, marginTop: 24 },
  getStartedBtn: { backgroundColor: '#E8001C', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  getStartedText: { color: 'white', fontWeight: '700', fontSize: 16 },
  nextBtn: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
})
