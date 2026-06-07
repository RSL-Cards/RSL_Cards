# eBay Production Launch Guide

This guide details the exact steps and configuration changes required to switch the eBay OAuth integration from **Sandbox** to **Production**.

## 1. eBay Developer Portal Configuration

Before touching any code, you need to configure your Production keys in the eBay Developer Portal:

1. Log in to your [eBay Developer Portal](https://developer.ebay.com/).
2. Go to your **Application Keys** and find your **Production** application.
3. Click **User Tokens** next to your Production keys.
4. Scroll down to the **Your OAuth Redirect URIs** section.
5. Add a new Redirect URI:
   - **Auth Accepted URL**: This MUST be your production backend API URL. For example: `https://api.rslcards.com/v1/users/ebay/callback`
   - **Auth Declined URL**: You can set this to your app's website or a decline route (e.g., `https://rslcards.com/oauth-declined`)
6. **Save** the settings.
7. eBay will automatically generate a **Production RuName** for you (it will look something like `Vinay_Golla-VinayGol-RSL-PR-...`). Copy this RuName.

---

## 2. Mobile App Configuration (`apps/dealer-app`)

When building your app for production (TestFlight / App Store / Play Store), your app's environment variables must point to the eBay Production API.

Update your production environment file (e.g., `.env.production` or wherever your CI/CD injects variables):

```env
EXPO_PUBLIC_EBAY_ENV=production
EXPO_PUBLIC_EBAY_CLIENT_ID=<Your_Production_Client_ID>
EXPO_PUBLIC_EBAY_AUTH_URL=https://auth.ebay.com/oauth2/authorize
EXPO_PUBLIC_EBAY_RU_NAME=<Your_Production_RuName_From_Step_1>
```

*(Note: The `auth.sandbox.ebay.com` domain is changed to `auth.ebay.com`)*

---

## 3. Backend Server Configuration

Your production backend must use the Production Client Secret to successfully exchange tokens.

For your Docker backend, update the environment variables directly in `infra/docker/.env.dev`:

```env
# Switch the backend mode to production
EBAY_ENV=production

# Ensure your Production variables are securely set
EBAY_PROD_CLIENT_ID=<Your_Production_Client_ID>
EBAY_PROD_CLIENT_SECRET=<Your_Production_Client_Secret>

# Ensure the correct production URLs are defined
EBAY_PROD_API_URL=https://api.ebay.com
EBAY_PROD_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token
EBAY_PROD_AUTH_URL=https://auth.ebay.com/oauth2/authorize
EBAY_PROD_RU_NAME=<Your_Production_RuName_From_Step_1>
```

---

## 4. App Store Deep Linking (Universal Links)

Currently, the backend redirects back to the mobile app using the Expo deep link scheme (`exp://...`). 

In production, you will no longer use `exp://`. You will use your app's custom scheme (e.g., `rslcards://`) or **Universal Links** (e.g., `https://rslcards.com/...`).

Ensure that your `app.json` has a custom scheme defined:
```json
{
  "expo": {
    "scheme": "rslcards"
  }
}
```

The app's code is already using `makeRedirectUri({ path: 'oauth/ebay' })` which will automatically handle using your custom scheme in production, so no code changes are needed in `more.tsx`! The backend will safely parse it and redirect to the correct app link.

---

## 5. Verification Checklist

Before releasing to real users, verify the following:
- [ ] Backend is receiving `EBAY_ENV=production`.
- [ ] Mobile app `.env` points to `auth.ebay.com`.
- [ ] eBay Developer Portal Production Auth Accepted URL points to your actual live production API domain, **not** localhost or ngrok.
- [ ] The `RuName` matches exactly in all 3 places (eBay Portal, Mobile `.env`, Backend `.env`).
