# PS Coach: AI Public Speaking Coach

A React Native Expo app with ElevenLabs voice AI coaching and multi-model LLM analysis (Gemini, Hugging Face, OpenAI) to practice public speaking.

## Features

- Modes for different public speaking tasks: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- Live coaching while users speak using ElevenLabs AI agent
- Simple setup for a practice session: topic, duration, and focus areas
- Post-session analysis with multiple LLM options:
  - Google Gemini 
  - Hugging Face DialoGPT 
  - OpenAI GPT-3.5-turbo
  - Demo analysis 

## Tech Stack

**Frontend**
- React Native with Expo 
- JavaScript

**Voice & AI**
- ElevenLabs React SDK 
- WebRTC 
- Google Gemini 1.5 Flash 
- Hugging Face DiabloGPT
- OpenAI GPT-3.5-turbo 
- LangChain integration

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

## How to Use

1. **Choose a public speaking mode:**
   - Elevator Pitch: Quick personal/product introduction
   - Lightning Talk: Concise technical presentation
   - Product Demo: Software or product walkthrough
   - Project Update: Status report for teams
   - Thesis Defense: Academic argument presentation

2. **Configure your session:**
   - **Topic**: What you'll be speaking about
   - **Your name**: For personalized coaching
   - **Duration**: Target length (30 seconds to 10 minutes)
   - **Focus areas**: Choose from Clarity, Structure, Pace, Filler Words

3. **Practice with live AI coaching:**
   - Allow microphone access when prompted
   - The AI coach greets you and guides the session
   - Speak naturally about your topic
   - Receive real-time voice guidance

4. **Get AI-powered analysis:**
   - After each session, receive feedback on:
      - **Strengths**: What you did well
      - **Improvements**: Specific areas to work on
      - **Next Steps**: Actionable recommendations
      - **Score**: Performance rating out of 10

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

- Voice interaction works best on web browsers
- Microphone permission is required for voice coaching
- Chrome and Firefox recommended for WebRTC
- Post-session analysis works with Google Gemini, Hugging Face API and OpenAI API. Demo analysis is available when no API keys are provided.

