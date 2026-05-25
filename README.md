# Business Bot

Snap any business card. Get a polished follow-up email in seconds.

A React Native (Android) app that uses Azure OpenAI vision to extract contact details from a business-card photo, then drafts a personalised follow-up email in your chosen tone (professional, casual, or persuasive).

## Features

- Camera + gallery business-card scanning
- Two-pass Azure OpenAI vision extraction with OCR error correction
- Editable review screen with field-by-field corrections
- Three tones for the draft: professional, casual, persuasive
- One-tap send via your mail app, or copy to clipboard
- Local contacts and draft history
- Profile-based personalisation
- All data stays on-device

## Stack

- React Native 0.85 (CLI, TypeScript, new architecture)
- React Navigation native stack
- Azure OpenAI Responses API (vision + text)
- AsyncStorage + Zustand for local persistence
- react-native-image-picker, react-native-linear-gradient, lucide-react-native

## Develop

```bash
npm install
npm start            # Metro bundler
npm run android      # build & run on connected device
```

## Build a release APK

```bash
cd android
./gradlew assembleRelease
# APK at android/app/build/outputs/apk/release/
```

Current release builds are signed with the default debug keystore so they are easy to install for testing. Before publishing to the Play Store, replace that with a proper production keystore.

## GitHub APK release

A GitHub Actions workflow is included at `.github/workflows/android-release.yml`.

You can use it in either of these ways:

1. Push a tag like `v0.1.0` or `app-v0.1.0`
2. Or run the **Android APK Release** workflow manually from the Actions tab and enter a tag

The workflow will:
- install the Android build toolchain
- build the Android release APK from `app/android`
- upload the APK as a workflow artifact
- attach the APK to a GitHub Release so you can download it directly

## Configure

On first launch the app asks for:

1. Azure OpenAI API key, endpoint, and deployment name
2. Your sender profile (name, email, company, designation, role)

Everything is stored locally with AsyncStorage.
