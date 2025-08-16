# PS Coach: AI Public Speaking Coach

A React Native app for practicing public speaking with real-time voice coaching using ElevenLabs Conversational AI and post-session analysis with OpenAI API.

## Features

- Modes for different public speaking tasks: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- Live coaching while users speak
- Simple session setup: topic, duration, and focus areas
- Personalized feedback and scoring after each session using OpenAI API 

## Tech Stack

- **Frontend**: React Native with Expo (web via React Native for Web)
- **Real-time Voice**: ElevenLabs Conversational AI (`@elevenlabs/react`)
- **AI Analysis**: OpenAI API integration (gpt-3.5-turbo)
- **LLM Model**: GPT-3.5-turbo for post-session feedback
- **Transport**: WebRTC with WebSocket fallback

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)

### Setup

1. **Clone and install dependencies:**
```bash
cd coachAI/coach-app
npm install
```

2. **Configure AI Service:**

   Create a `.env` file in the coach-app directory:
   ```bash
   cp .env.example .env
   ```

   - **ElevenLabs**: Add agent ID to `ELEVENLABS_AGENT_ID` in `.env`
   - **OpenAI**: Add API key to `EXPO_PUBLIC_OPENAI_API_KEY` in `.env`

3. **Start the development server:**
```bash
npx expo start
```

4. **Run on web:**
```bash
npx expo start --web
```

## How to Use

1. **Choose a speaking mode:**
   - Elevator Pitch (30s-2min): Quick personal/product introduction
   - Lightning Talk (3-5min): Concise technical presentation
   - Product Demo (2-10min): Software or product walkthrough
   - Project Update (1-5min): Status report for teams
   - Thesis Defense (5-10min): Academic argument presentation

2. **Configure your session:**
   - **Topic**: What you'll be speaking about
   - **Your name**: For personalized coaching
   - **Duration**: Target length (30 seconds to 10 minutes)
   - **Focus areas**: Choose from Clarity, Structure, Pace, Body Language, Eye Contact, Filler Words

3. **Practice with live AI coaching:**
   - Allow microphone access when prompted
   - The AI coach greets you and guides the session
   - Speak naturally about your topic
   - Receive real-time encouragement and guidance

4. **Get AI-powered analysis:**
   - After your session, receive feedback on:
      - **Strengths**: What you did well
      - **Improvements**: Specific areas to work on
      - **Next Steps**: Actionable recommendations
      - **Score**: Performance rating


## Project Structure

```
coachAI/
├── coach-app/          
│   ├── App.js          # Main app component with Material Design UI
│   ├── index.js        # App entry point
│   ├── package.json    # Dependencies and scripts
│   ├── metro.config.js # Metro bundler configuration
│   ├── vercel.json     # Vercel deployment config
│   ├── .env.example    # Environment variables template
│   ├── assets/         # App icons and images
│   ├── lib/            # Utility modules
│   │   ├── config.js   # ElevenLabs agent configuration
│   │   ├── analysis.js # penAI API session analysis
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

- **Voice interaction** works best on web browsers
- **Microphone permission** is required for voice coaching
- **Browser compatibility**: Chrome and Firefox recommended for WebRTC
- **Post-session Analysis**: Requires OpenAI API key for AI-powered feedback. Demo analysis available when OpenAI API is unavailable.
