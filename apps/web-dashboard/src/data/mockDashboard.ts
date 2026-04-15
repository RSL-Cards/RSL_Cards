export const DEALER = {
  id: 'dealer-001',
  name: 'Mike Sherrer',
  email: 'mike@rslcards.com',
  initials: 'MS',
  plan: 'pro',
  avatar_color: '#E8001C',
  dealer_profile: {
    display_name: 'Mike Sherrer Cards',
    custom_url: 'mikesherrer',
    sports: ['Football', 'Baseball', 'Basketball'],
    rating: 4.9,
    review_count: 127,
  }
}

export const METRICS = {
  today: {
    revenue: 890,    profit: 182,     margin: 28.4,
    cards_bought: 4, cards_sold: 3,   total_spent: 640,
  },
  week: {
    revenue: 4280,   profit: 1142,    margin: 26.7,
    cards_bought: 18,cards_sold: 14,  revenue_change: 12.4,
  },
  month: {
    revenue: 18420,  profit: 4890,    margin: 26.5,
    cards_bought: 72,cards_sold: 58,  revenue_change: 8.2,
  },
  total_inventory_value: 28450,
  total_cost_basis: 21300,
  unrealized_gain: 7150,
  unrealized_gain_pct: 33.6,
}

export const REVENUE_CHART_DATA = [
  { date: 'Apr 1', revenue: 880,  profit: 210 },
  { date: 'Apr 2', revenue: 1200, profit: 340 },
  { date: 'Apr 3', revenue: 650,  profit: 180 },
  { date: 'Apr 4', revenue: 980,  profit: 260 },
  { date: 'Apr 5', revenue: 1450, profit: 420 },
  { date: 'Apr 6', revenue: 890,  profit: 230 },
  { date: 'Apr 7', revenue: 720,  profit: 190 },
  { date: 'Apr 8', revenue: 1100, profit: 290 },
  { date: 'Apr 9', revenue: 1350, profit: 380 },
  { date: 'Apr 10',revenue: 960,  profit: 250 },
  { date: 'Apr 11',revenue: 1200, profit: 320 },
  { date: 'Apr 12',revenue: 780,  profit: 200 },
  { date: 'Apr 13',revenue: 1680, profit: 490 },
  { date: 'Apr 14',revenue: 990,  profit: 260 },
  { date: 'Apr 15',revenue: 890,  profit: 182 },
]

export const CHANNEL_DATA = [
  { channel: 'Card Shows', revenue: 8200,  profit: 2460, pct: 44.5, color: '#E8001C' },
  { channel: 'eBay',       revenue: 6800,  profit: 1820, pct: 36.9, color: '#0057FF' },
  { channel: 'Whatnot',    revenue: 2100,  profit: 490,  pct: 11.4, color: '#7B2FFF' },
  { channel: 'TCGPlayer',  revenue: 980,   profit: 220,  pct: 5.3,  color: '#00BCD4' },
  { channel: 'Other',      revenue: 340,   profit: 80,   pct: 1.9,  color: '#555555' },
]

export const INVENTORY_TABLE_DATA = [
  {
    id: 'inv-001', player_name: 'Patrick Mahomes', year: 2017,
    set_name: 'Prizm Silver', grade_key: 'PSA_10',
    sport: 'Football', cost_basis: 280, market_value: 341,
    unrealized_gain: 61, unrealized_gain_pct: 21.8,
    status: 'unlisted', days_held: 12,
    comp_avg: 337, comp_trend: 8.2,
    platforms_listed: [],
  },
  {
    id: 'inv-002', player_name: 'Jayden Daniels', year: 2024,
    set_name: 'Prizm Silver', grade_key: 'RAW',
    sport: 'Football', cost_basis: 35, market_value: 58,
    unrealized_gain: 23, unrealized_gain_pct: 65.7,
    status: 'unlisted', days_held: 3,
    comp_avg: 58, comp_trend: 18.2,
    platforms_listed: [],
  },
  {
    id: 'inv-003', player_name: 'Mike Trout', year: 2011,
    set_name: 'Topps Update', grade_key: 'PSA_9',
    sport: 'Baseball', cost_basis: 180, market_value: 155,
    unrealized_gain: -25, unrealized_gain_pct: -13.9,
    status: 'unlisted', days_held: 67,
    comp_avg: 155, comp_trend: -8.1,
    platforms_listed: [],
  },
  {
    id: 'inv-004', player_name: 'LeBron James', year: 2003,
    set_name: 'Topps Chrome', grade_key: 'BGS_9',
    sport: 'Basketball', cost_basis: 890, market_value: 1250,
    unrealized_gain: 360, unrealized_gain_pct: 40.4,
    status: 'listed', days_held: 22,
    comp_avg: 1250, comp_trend: 5.2,
    platforms_listed: ['eBay', 'Whatnot'],
  },
  {
    id: 'inv-005', player_name: 'Aaron Judge', year: 2017,
    set_name: 'Topps Chrome Refractor', grade_key: 'PSA_10',
    sport: 'Baseball', cost_basis: 520, market_value: 680,
    unrealized_gain: 160, unrealized_gain_pct: 30.8,
    status: 'unlisted', days_held: 8,
    comp_avg: 680, comp_trend: 3.1,
    platforms_listed: [],
  },
  {
    id: 'inv-006', player_name: 'Josh Allen', year: 2018,
    set_name: 'Prizm Silver', grade_key: 'PSA_10',
    sport: 'Football', cost_basis: 389, market_value: 412,
    unrealized_gain: 23, unrealized_gain_pct: 5.9,
    status: 'listed', days_held: 5,
    comp_avg: 409, comp_trend: 1.8,
    platforms_listed: ['eBay'],
  },
  {
    id: 'inv-007', player_name: 'Bryce Harper', year: 2012,
    set_name: 'Bowman Chrome', grade_key: 'PSA_10',
    sport: 'Baseball', cost_basis: 95, market_value: 88,
    unrealized_gain: -7, unrealized_gain_pct: -7.4,
    status: 'unlisted', days_held: 92,
    comp_avg: 88, comp_trend: -4.2,
    platforms_listed: [],
  },
  {
    id: 'inv-008', player_name: 'Luka Doncic', year: 2018,
    set_name: 'Prizm Silver', grade_key: 'PSA_10',
    sport: 'Basketball', cost_basis: 420, market_value: 510,
    unrealized_gain: 90, unrealized_gain_pct: 21.4,
    status: 'unlisted', days_held: 15,
    comp_avg: 505, comp_trend: 4.7,
    platforms_listed: [],
  },
]

export const TOP_MOVERS = [
  { player: 'Jayden Daniels',  change: +18.2, price: 58,   grade: 'RAW',    sport: 'Football',    trend: 'up',   reason: 'Record-breaking game' },
  { player: 'Shohei Ohtani',   change: +12.4, price: 445,  grade: 'PSA_10', sport: 'Baseball',    trend: 'up',   reason: 'WBC roster reveal' },
  { player: 'Patrick Mahomes', change: +8.2,  price: 341,  grade: 'PSA_10', sport: 'Football',    trend: 'up',   reason: 'Chiefs playoff momentum' },
  { player: 'Mike Trout',      change: -8.1,  price: 155,  grade: 'PSA_9',  sport: 'Baseball',    trend: 'down', reason: 'Extended IL placement' },
  { player: 'Bryce Harper',    change: -4.2,  price: 88,   grade: 'PSA_10', sport: 'Baseball',    trend: 'down', reason: 'Market correction' },
]

export const PLATFORM_FEE_TABLE = [
  { platform: 'eBay',      fee_pct: 12.85, shipping: 5,   best_for: 'High-value graded' },
  { platform: 'Whatnot',   fee_pct: 8.00,  shipping: 5,   best_for: 'Live auction lots' },
  { platform: 'TCGPlayer', fee_pct: 10.25, shipping: 5,   best_for: 'Modern sports cards' },
  { platform: 'Shopify',   fee_pct: 2.00,  shipping: 0,   best_for: 'Regular customers' },
  { platform: 'COMC',      fee_pct: 20.00, shipping: 0,   best_for: 'Slow movers, bulk' },
  { platform: 'Mercari',   fee_pct: 10.00, shipping: 5,   best_for: 'Raw/budget cards' },
]

export const RECENT_TRANSACTIONS = [
  { id:'tx-001', type:'sell', player:'CJ Stroud',       grade:'PSA 10', price:198, profit:42,   margin:28.9, channel:'Card Show', payment:'Cash',    time:'9:15 AM' },
  { id:'tx-002', type:'buy',  player:'Josh Allen',      grade:'PSA 10', price:389, profit:null, margin:null, channel:'Card Show', payment:'Venmo',   time:'10:30 AM' },
  { id:'tx-003', type:'sell', player:'Jayden Daniels',  grade:'RAW',    price:58,  profit:23,   margin:65.7, channel:'Card Show', payment:'CashApp', time:'11:45 AM' },
  { id:'tx-004', type:'sell', player:'Mahomes',         grade:'PSA 10', price:341, profit:61,   margin:21.8, channel:'eBay',      payment:'eBay',    time:'2:10 PM' },
  { id:'tx-005', type:'buy',  player:'Luka Doncic',    grade:'PSA 10', price:420, profit:null, margin:null, channel:'Card Show', payment:'Zelle',   time:'3:20 PM' },
]

export const AI_INSIGHTS = [
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

export const COMP_HISTORY_DATA = [
  { date: 'Jan 15', price: 310 },
  { date: 'Jan 22', price: 315 },
  { date: 'Jan 29', price: 308 },
  { date: 'Feb 5', price: 322 },
  { date: 'Feb 12', price: 318 },
  { date: 'Feb 19', price: 325 },
  { date: 'Feb 26', price: 331 },
  { date: 'Mar 5', price: 328 },
  { date: 'Mar 12', price: 335 },
  { date: 'Mar 19', price: 338 },
  { date: 'Mar 26', price: 342 },
  { date: 'Apr 2', price: 339 },
  { date: 'Apr 9', price: 341 },
  { date: 'Apr 15', price: 341 },
]

export const SPORT_PERFORMANCE_DATA = [
  { sport: 'Football', profit: 2890, percentage: 59 },
  { sport: 'Baseball', profit: 1340, percentage: 27 },
  { sport: 'Basketball', profit: 660, percentage: 14 },
]
