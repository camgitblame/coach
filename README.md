# PS Coach: AI Public Speaking Coach

A React Native app for practicing public speaking with real-time voice coaching using the ElevenLabs Agent and React SDK

## Features

- Modes for different public speaking tasks: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- Live coaching while users speak
- Simple session setup: topic, duration, and focus areas

## Tech Stack

- React Native with Expo (web via React Native for Web)
- ElevenLabs React SDK (`@elevenlabs/react`)
- WebRTC transport (with WebSocket fallback)
- Browser `getUserMedia` for microphone access

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)

### Setup

1. Clone and install dependencies:
```bash
cd coachAI/coach-app
npm install
```

2. Start the app:
```bash
npx expo start
```

3. Run on web:
```bash
npx expo start --web
```


## How to Use

1. **Choose a speaking mode:**
   - Elevator Pitch
   - Lightning Talk
   - Product Demo
   - Project Update
   - Thesis Defense

2. **Configure the session:**
   - Your topic
   - Your name
   - Duration target (30 seconds to 10 minutes)
   - Focus areas: Clarity, Structure, Pace, Filler Words

3. **Begin coaching:**
   - Allow microphone access 
   - The coach greets you and guides the session
   - Speak naturally
   - Get feedback at the end of your target duration

## Project Structure

```
coachAI/
├── coach-app/          
│   ├── App.js          # Main app component with UI and conversation logic
│   ├── index.js        # App entry point
│   ├── package.json    # Dependencies and scripts
│   ├── metro.config.js # Metro bundler configuration
│   ├── vercel.json     # Vercel deployment config
│   ├── assets/         # App icons and images
│   ├── lib/            # Utility modules
│   │   ├── config.js   # ElevenLabs agent configuration
│   │   ├── voice.web.js    # Web voice integration
│   │   └── voice.native.js # Native voice integration
│   └── web-dist/       # Web export output 
└── README.md           
```

## Development

### Scripts
```bash
# Start development server
npm start
# or
npx expo start

# Run on platforms
npx expo start --web     # Web browser
npx expo start --ios     # iOS simulator  
npx expo start --android # Android emulator

# Build for production web
npm run build:web
# or
npx expo export --platform web
```

## Deployment

The app is deployed with Vercel at https://pscoach.vercel.app/

## Notes

- Voice interaction currently works best on the web 
- Make sure the browser has mic permission
- Use Chrome or Firefox for the most reliable WebRTC behavior

