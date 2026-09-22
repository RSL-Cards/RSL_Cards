---
name: app-store-compliance
description: >-
  Audits mobile applications for Apple App Store and Google Play Review Guideline compliance.
  Use when preparing an iOS or Android app for release, auditing permissions, privacy manifests,
  rejection risks (Guideline 2.1 Performance, Guideline 5.1 Privacy, Guideline 3.1 Payments,
  Guideline 4.8 Apple Login), metadata validation, and resolving App Store review rejections.
---

# App Store Compliance Skill

Comprehensive compliance playbook and automated auditor for iOS and Android app releases, targeting Apple App Store Review Guidelines and Google Play Developer Policies.

## Quick Execution

### 1. Run Automated Compliance Guard
Scan code, manifests, and purpose strings in the app:
```bash
bash .agents/skills/app-store-compliance/agent-os/hooks/app-store-compliance-guard.sh apps/dealer-app
```

### 2. Run Comprehensive Release Audit
Compile a release readiness report with severity-ranked findings:
```bash
python3 .agents/skills/app-store-compliance/scripts/release-audit.py apps/dealer-app
```

### 3. Validate Privacy Manifests
Verify privacy manifests and required reason APIs:
```bash
python3 .agents/skills/app-store-compliance/scripts/validate-privacy-manifest.py apps/dealer-app
```

## Mandatory Verification Areas

1. **Permissions & Purpose Strings (Guideline 5.1.1)**
   - Verify every sensitive permission (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`) has a specific, clear explanation of user benefit.
   - Confirm unused permissions (e.g. `RECORD_AUDIO`, `NSMicrophoneUsageDescription`) are completely stripped.

2. **Apple Login (Guideline 4.8)**
   - Any app supporting third-party social logins (e.g. Google Sign-In) MUST offer Sign in with Apple as an equivalent option with equal prominence.

3. **In-App Purchases vs External Payment (Guideline 3.1.1 & 3.1.2)**
   - Digital goods, premium tiers, or features must use Apple StoreKit / In-App Purchase.
   - Restore Purchases button must be functional and easily accessible.

4. **Account Deletion (Guideline 5.1.1)**
   - Apps that allow account creation must provide an easy, discoverable in-app account deletion mechanism.

5. **AI Generated Content & Disclosures (EU AI Act & Apple 5.1.2)**
   - Content moderation safeguards, clear AI disclosure modals, and consent mechanisms before transmitting user inputs to external LLM providers.

6. **iPad Compatibility & Guideline 2.1(a) Completeness**
   - Apps targeting `supportsTablet: false` must run cleanly in iPhone compatibility mode without crashing on iPad devices (e.g. iPad Air 11-inch M3).
   - Multitasking and orientation locks must match the declared device families.

7. **Export Compliance**
   - `ITSAppUsesNonExemptEncryption` set to `false` in `Info.plist` if using standard HTTPS/TLS encryption.

## Reference Documents
- Pre-submission checklist: [PRE-SUBMISSION-CHECKLIST.md](./docs/PRE-SUBMISSION-CHECKLIST.md)
- Rejection patterns: [rejection-patterns.json](./data/rejection-patterns.json)
- Rules index: [references/rules/](./references/rules/)
