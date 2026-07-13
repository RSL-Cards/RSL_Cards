type GoogleCredentialResponse = {
  credential?: string
}

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    use_fedcm_for_prompt?: boolean
  }) => void
  prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
  cancel: () => void
}

type AppleAuthResponse = {
  authorization?: {
    id_token?: string
  }
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
    AppleID?: {
      auth?: {
        init: (config: {
          clientId: string
          scope: string
          redirectURI: string
          usePopup: boolean
        }) => void
        signIn: () => Promise<AppleAuthResponse>
      }
    }
  }
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(id) as HTMLScriptElement | null

    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load sign in script.'))
    document.head.appendChild(script)
  })
}

export async function getGoogleIdToken() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.')
  }

  await loadScript('https://accounts.google.com/gsi/client', 'google-identity-services')

  return new Promise<string>((resolve, reject) => {
    const googleId = window.google?.accounts?.id

    if (!googleId) {
      reject(new Error('Google sign in is unavailable.'))
      return
    }

    googleId.initialize({
      client_id: clientId,
      use_fedcm_for_prompt: false,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential)
          return
        }

        reject(new Error('Google did not return an identity token.'))
      },
    })

    googleId.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google sign in was cancelled or unavailable.'))
      }
    })
  })
}

export async function getAppleIdToken() {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
  const redirectURI =
    process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? window.location.origin

  if (!clientId) {
    throw new Error('Missing NEXT_PUBLIC_APPLE_CLIENT_ID.')
  }

  await loadScript(
    'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    'apple-sign-in-sdk',
  )

  const appleAuth = window.AppleID?.auth

  if (!appleAuth) {
    throw new Error('Apple sign in is unavailable.')
  }

  appleAuth.init({
    clientId,
    scope: 'email name',
    redirectURI,
    usePopup: true,
  })

  const response = await appleAuth.signIn()
  const idToken = response.authorization?.id_token

  if (!idToken) {
    throw new Error('Apple did not return an identity token.')
  }

  return idToken
}

export {}
