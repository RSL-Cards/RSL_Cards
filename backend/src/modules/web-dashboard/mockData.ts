type MarketMoverTrend = 'up' | 'down'

export const TOP_MOVERS: Array<{
  player: string
  change: number
  price: number
  grade: string
  sport: string
  trend: MarketMoverTrend
  reason: string
}> = [
  { player: 'Jayden Daniels',  change: +18.2, price: 58,   grade: 'RAW',    sport: 'Football',    trend: 'up',   reason: 'Record-breaking game' },
  { player: 'Shohei Ohtani',   change: +12.4, price: 445,  grade: 'PSA_10', sport: 'Baseball',    trend: 'up',   reason: 'WBC roster reveal' },
  { player: 'Patrick Mahomes', change: +8.2,  price: 341,  grade: 'PSA_10', sport: 'Football',    trend: 'up',   reason: 'Chiefs playoff momentum' },
  { player: 'Mike Trout',      change: -8.1,  price: 155,  grade: 'PSA_9',  sport: 'Baseball',    trend: 'down', reason: 'Extended IL placement' },
  { player: 'Bryce Harper',    change: -4.2,  price: 88,   grade: 'PSA_10', sport: 'Baseball',    trend: 'down', reason: 'Market correction' },
]

type AIInsightType = 'BREAKOUT' | 'MOMENTUM' | 'DECLINE'
type AIInsightTrend = 'up' | 'down'

export const AI_INSIGHTS: Array<{
  id: string
  type: AIInsightType
  player: string
  sport: string
  headline: string
  body: string
  price_change: string
  price_range: string
  published: string
  affected_cards: number
  trend: AIInsightTrend
  recommendation: string
}> = [
  {
    id: 'ai-001',
    type: 'BREAKOUT',
    player: 'JAYDEN DANIELS',
    sport: 'Football',
    headline: 'Daniels rookies surge 18% after record-breaking game',
    body: 'Jayden Daniels threw for 342 yards and 4 TDs Sunday, setting a rookie record. PSA 10 Prizm Silvers jumped from $48 to $58 within 48 hours as collectors rush to buy.',
    price_change: '+18.2%',
    price_range: '$48 → $58',
    published: '2 hours ago',
    affected_cards: 3,
    trend: 'up',
    recommendation: 'HOLD'
  },
  {
    id: 'ai-002',
    type: 'MOMENTUM',
    player: 'PATRICK MAHOMES',
    sport: 'Football',
    headline: 'Mahomes cards hold firm on playoff push',
    body: 'With Chiefs advancing to the divisional round, Mahomes PSA 10 Prizm Silvers are maintaining momentum at $341 average, showing 8.2% growth this week.',
    price_change: '+8.2%',
    price_range: '$310 → $341',
    published: '4 hours ago',
    affected_cards: 1,
    trend: 'up',
    recommendation: 'HOLD'
  },
  {
    id: 'ai-003',
    type: 'DECLINE',
    player: 'MIKE TROUT',
    sport: 'Baseball',
    headline: 'Trout PSA 9 weakening — consider listing',
    body: 'Mike Trout PSA 9 cards have declined for 3 consecutive weeks, now down 8.1% to $155 average. Extended IL placement and reduced playing time are driving the decline.',
    price_change: '-8.1%',
    price_range: '$169 → $155',
    published: '6 hours ago',
    affected_cards: 1,
    trend: 'down',
    recommendation: 'SELL'
  }
]
