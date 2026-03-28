# 👁️ NayanAI — The Blind Child Reading Companion
### HackXtreme 2026 | Built with RunAnywhere SDK

## What it does
NayanAI reads printed Hindi and Punjabi textbook pages aloud for visually
impaired children. Point the camera. Tap once. Hear the text explained simply.

**Zero internet. Zero cost. Works on any Android phone. Forever.**

## Demo
1. Enable Airplane Mode ✈️
2. Open NayanAI
3. Point camera at printed Hindi text
4. Tap the scan button
5. Hear the text read aloud in Hindi

## Tech Stack
| Layer | Technology | Why |
|---|---|---|
| Camera | react-native-vision-camera | Direct hardware access |
| OCR | Google ML Kit (on-device) | Best Hindi/Punjabi accuracy |
| LLM | SmolLM2 via RunAnywhere SDK | Simplifies text for children |
| TTS | Android built-in (hi-IN) | Zero download, works offline |

## Setup
```bash
git clone https://github.com/YOUR_TEAM/nayan-ai
cd nayan-ai
npm install
npx react-native run-android
```

## Why this wins
- Uses ALL RunAnywhere SDK capabilities
- Solves a real problem for 5 million visually impaired children
- Works completely offline — airplane mode demo on stage
- One-button UI works for low-tech users
- Zero cost to deploy to any school in India
