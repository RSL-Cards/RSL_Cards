import type { AuthCopy, AuthMode } from './authTypes'

export function getAuthCopy(mode: AuthMode): AuthCopy {
  if (mode === 'register') {
    return {
      eyebrow: 'Create dealer account',
      title: 'Start your dashboard',
      description: 'Your account will be created with dealer access.',
      button: 'Create account',
    }
  }

  if (mode === 'forgot-password') {
    return {
      eyebrow: 'Password recovery',
      title: 'Get a reset code',
      description:
        'Enter your email and we will send an OTP if the account exists.',
      button: 'Send reset OTP',
    }
  }

  if (mode === 'reset-password') {
    return {
      eyebrow: 'Reset password',
      title: 'Choose a new password',
      description: 'Use the OTP from your reset request and set a new password.',
      button: 'Reset password',
    }
  }

  return {
    eyebrow: 'Dealer sign in',
    title: 'Welcome back',
    description: 'Sign in to continue managing your card business.',
    button: 'Sign in',
  }
}
