# PS Coach: AI Public Speaking Coach

A React Native Expo app with conversational AI coaching, multi-model LLM analysis (Gemini, Hugging Face, OpenAI) and AI Agent for public speaking practice.

## Features

- Modes for different public speaking tasks: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- Live coaching while users speak using ElevenLabs AI agent
- Simple session setup: topic, duration, and focus areas
- Post-session analysis with multiple LLM options:
  - Google Gemini 
  - Hugging Face DialoGPT 
  - OpenAI GPT-3.5-turbo
- AI Practice Agent (powered by OpenAI GPT-4o-mini):
  - 1-week practice plan with daily exercises
  - Curated learning resources (books, videos, courses, articles)
  - Customizable by skill level


## Tech Stack

**Frontend**
- React Native with Expo 
- JavaScript

**Voice & AI**
- ElevenLabs React SDK 
- WebRTC 
- Google Gemini 1.5 Flash 
- Hugging Face DiabloGPT
- OpenAI GPT-4o-mini 


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

2. **Configure AI Services:**

   Create a `.env` file in coach-app:
   ```bash
   cp .env.example .env
   ```
   In `.env`: 
   - Add ElevenLabs agent ID to `ELEVENLABS_AGENT_ID`
   - Add Google Gemini API key to `EXPO_PUBLIC_GEMINI_API_KEY` 
   - Add Hugging Face token to `EXPO_PUBLIC_HUGGINGFACE_API_KEY`  
   - Add OpenAI API key to `EXPO_PUBLIC_OPENAI_API_KEY` 

3. **Start the development server:**
```bash
npx expo start
```

4. **Run on web:**
```bash
npx expo start --web
```

## Project Structure

```
coachAI/
├── coach-app/          
│   ├── App.js          # Main app component 
│   ├── index.js        # App entry point
│   ├── package.json    # Dependencies and scripts
│   ├── metro.config.js # Metro bundler config
│   ├── vercel.json     # Vercel config
│   ├── .env.example    # Environment variables template
│   ├── assets/         # App icons and images
│   ├── lib/            # Utility modules
│   │   ├── config.js   # ElevenLabs agent config
│   │   ├── analysis.js # AI analysis (Gemini, Hugging Face, OpenAI)
│   │   ├── practiceAgent.js # OpenAI GPT-4o-mini practice agent with curated resources
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
npx expo start --web     #

# Build for production web
npm run build:web
# or
npx expo export --platform web
```

## Deployment

The app is deployed with Vercel at https://pscoach.vercel.app/

## Notes

- Voice interaction works best on web browsers
- Microphone permission is required for voice coaching
- Chrome and Firefox recommended for WebRTC

