export const COLORS = {
  background:    '#000000',
  surface:       '#111111',
  surface2:      '#1A1A1A',
  surface3:      '#222222',
  border:        '#2A2A2A',
  accentRed:     '#E8001C',
  accentBlue:    '#0057FF',
  textPrimary:   '#FFFFFF',
  textSecondary: '#888888',
  textMuted:     '#555555',
  success:       '#00C853',
  warning:       '#FFB300',
  danger:        '#E8001C',
  gold:          '#FFD700',
}

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
}

export const RADIUS = {
  sm: 6, md: 10, lg: 16, xl: 24, full: 9999,
}

export const FONT = {
  display: { fontSize: 36, fontWeight: '900' as const },
  h1:      { fontSize: 28, fontWeight: '700' as const },
  h2:      { fontSize: 22, fontWeight: '700' as const },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 14, fontWeight: '400' as const },
  small:   { fontSize: 12, fontWeight: '400' as const },
  label:   { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5 },
}
