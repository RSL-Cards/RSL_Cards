# RSL Cards Pro — Local Build & Release Guide 🚀

This guide provides step-by-step instructions on how to build, test, and release local Android App Bundles (`.aab`) and direct `.apk` binaries for **RSL Cards Pro**.

---

## 🔑 Critical Credentials & Keystore Setup

The Android release build requires the official Google Play Production Keystore.

| Item | Value / Location |
| :--- | :--- |
| **Keystore File** | `apps/dealer-app/android/app/production.keystore` |
| **Keystore Password** | `b8f470ed9223ff474e77e96469bfbd8c` |
| **Key Alias** | `b8dd904c6aa0bd63ec30053b1c0c4238` |
| **Key Password** | `ffd71632671122a5dba747189891a23d` |
| **SHA-1 Fingerprint** | `50:D4:FA:44:BD:88:80:4E:6C:B3:21:E6:AB:C0:73:25:76:0E:20:AB` |

> [!CAUTION]
> Always back up `production.keystore` and its passwords in a secure password manager. Google Play Console will reject updates signed with any other key.

---

## 🛠️ Step 1: Pre-Flight Clean Up & Version Bump

Before running a new release build, perform these two steps:

### 1. Remove Stale Pre-Baked Bundles (Forces Fresh UI Compilation)
```bash
rm -f apps/dealer-app/android/app/src/main/assets/index.android.bundle
```

### 2. Increment Version Code
In [`apps/dealer-app/app.json`](file:///Users/vinay/RSL_Cards/RSL/apps/dealer-app/app.json), increment `versionCode` by 1 (e.g. from `16` to `17`):
```json
"android": {
  "versionCode": 17,
  "package": "com.rslcards.dealer"
}
```

---

## 📦 Step 2: Build Production `.aab` Locally for Google Play

Run the following commands in your Mac terminal:

```bash
# 1. Navigate to Android project directory
cd /Users/vinay/RSL_Cards/RSL/apps/dealer-app/android

# 2. Set Android SDK path
export ANDROID_HOME=/Users/vinay/Library/Android/sdk

# 3. Compile Production Signed .aab
./gradlew bundleRelease
```

### Output Location:
The generated `.aab` file will be saved at:
[`apps/dealer-app/android/app/build/outputs/bundle/release/app-release.aab`](file:///Users/vinay/RSL_Cards/RSL/apps/dealer-app/android/app/build/outputs/bundle/release/app-release.aab)

---

## 📲 Step 3: Upload `.aab` to Google Play Console

1. Open [Google Play Console](https://play.google.com/console).
2. Select **RSL Cards Pro**.
3. In the left menu under **Testing**, click **Internal testing**.
4. Click **Create new release** (top right).
5. Click **Upload** and select `app-release.aab`.
6. Add Release Notes:
   ```html
   <en-US>
   Performance enhancements, updated inventory features, and UI stability improvements.
   </en-US>
   ```
7. Click **Save** -> **Next** -> **Start rollout to Internal testing**.

---

## ⚡ Instant Over-The-Air (OTA) Updates (No Re-Install Required)

For fast JavaScript / UI updates that do not change native code:

```bash
cd /Users/vinay/RSL_Cards/RSL/apps/dealer-app
npx eas update --branch production --message "UI component updates"
```

*Devices running the app will automatically receive the updated UI on their next launch!*

---

## 📲 Direct `.apk` Build for Quick Phone Testing

To test directly on an Android device without going through Google Play:

```bash
cd /Users/vinay/RSL_Cards/RSL/apps/dealer-app
npx eas build -p android -e preview
```

Download the resulting `.apk` link directly onto your phone and tap **Install**.
