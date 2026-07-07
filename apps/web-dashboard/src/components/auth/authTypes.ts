export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

export type OAuthProvider = 'google' | 'apple'

export interface AuthCopy {
  eyebrow: string
  title: string
  description: string
  button: string
}
