# PS Coach: AI Public Speaking Coach

A React Native app that provides AI-powered public speaking coaching with real-time voice interaction using ElevenLabs conversational AI.

## Features

- Multiple Speaking Modes: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- Real-time Voice Coaching: live guidance during practice sessions 
- Customizable Sessions: set the topic, duration, focus areas of the session

## Tech Stack

- **Frontend**: React Native with Expo, React Native for Web  
- **Voice AI**: ElevenLabs React SDK (`@elevenlabs/react`)  
- **Realtime transport**: WebRTC by default, with WebSocket fallback  
- **Audio**: Browser `getUserMedia` on web

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

1. **Select a speaking mode:**
   - Elevator Pitch
   - Lightning Talk
   - Product Demo
   - Project Update
   - Thesis Defense

2. **Configure your session:**
   - Topic
   - Your name
   - Duration target (30 seconds to 10 minutes)
   - Focus areas: Clarity, Structure, Pace, Filler Words

3. **Begin coaching:**
   - Allow microphone access when prompted
   - The coach greets you and guides the session
   - Speak naturally
   - Receive feedback at the end of your target duration

## Project Structure

```
coachAI/
├── coach-app/          
│   ├── App.js          # Main app component with UI and conversation logic
│   ├── index.js        # App entry point
│   ├── package.json    # Dependencies and scripts
│   ├── metro.config.js # Metro bundler configuration
│   ├── vercel.json     # Vercel deployment configuration
│   ├── assets/         # App icons and images
│   ├── lib/            # Utility modules
│   │   ├── config.js   # ElevenLabs agent configuration
│   │   ├── voice.web.js    # Web voice integration
│   │   └── voice.native.js # Native voice integration
│   └── web-dist/       # Web export output 
└── README.md           
```

### Key Dependencies
- `@elevenlabs/react`: ElevenLabs React SDK for voice conversations
- `expo`: React Native development platform
- `react-native`, `react-native-web`, `react-dom`: Core React Native components
- `expo-av`, `expo-haptics`: Expo audio/video and haptic feedback
- `react-native-svg: for icons

## Development

### Scripts
```bash
# Start development server
npm start
# or
npx expo start

# Run on specific platforms
npx expo start --web     # Web browser
npx expo start --ios     # iOS simulator  
npx expo start --android # Android emulator

# Build for production web (static export to web-dist/)
npm run build:web
# or
npx expo export --platform web
```

## Deployment

The app is deployed with Vercel at https://pscoach.vercel.app/

## Notes

- Voice interaction currently works best on the **web platform**
- Make sure microphone permissions are granted
- Use Chrome or Firefox for the most reliable WebRTC behavior

