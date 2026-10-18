export const LOGIN_URL = 'https://app.rslcards.com/login'
export const SUPPORT_EMAIL = 'support@rslcards.com'
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// Leave unset until the App Store listing URL is verified; the badge is hidden without it.
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || ''

// Publication gates from the restructure report. Flip only after the workflow is verified.
export const OFFLINE_CAPTURE_VERIFIED = false

export const navLinks = [
  { label: 'Web App', href: '/web-app' },
  { label: 'Mobile App', href: '/mobile-app' },
  { label: 'About Us', href: '/about' },
  { label: 'Support', href: '/support' },
]
