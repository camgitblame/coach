# CoachAI - Public Speaking Coach

A React Native app that provides AI-powered public speaking coaching with real-time voice interaction using ElevenLabs conversational AI.

## Features

- **Multiple Speaking Modes**: Elevator Pitch, Lightning Talk, Product Demo, Project Update, Thesis Defense
- **Real-time Voice Coaching**: ElevenLabs AI agent provides live feedback during practice sessions
- **Customizable Sessions**: Set topic, duration, focus areas, and speaker name
- **Live Captions**: See real-time transcription of conversations
- **Cross-platform**: Works on iOS, Android, and web (voice features currently web-only)

## Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)

### Setup

1. **Clone and install dependencies**:
```bash
cd coachAI/coach-app
npm install
```

2. **Configure ElevenLabs Agent**:
   - Update `coach-app/lib/config.js` with your agent ID:
   ```javascript
   export const ELEVEN_AGENT_ID = "your_agent_id_here";
   ```

3. **Start the app**:
```bash
npx expo start
```

4. **Run on web** (recommended for voice features):
   - Press `w` in the Expo CLI or run `npx expo start --web`

## How to Use

1. **Select a speaking mode** from the available options:
   - **Elevator Pitch**: Explain who you are, what you do, and why it matters
   - **Lightning Talk**: Share one idea clearly in under 2 minutes  
   - **Product Demo**: Hook, problem, solution, and call to action
   - **Project Update**: Status, impact, risks, and next steps
   - **Thesis Defense**: Core claim, evidence, limitations, future work

2. **Configure your session**:
   - Set your topic (or use the suggested prompt)
   - Enter your name (optional)
   - Adjust duration target (30 seconds to 10 minutes)
   - Choose focus areas: Clarity, Structure, Pace, Filler Words

3. **Begin coaching**:
   - Allow microphone access when prompted
   - The AI coach will guide you through a warmup
   - Speak naturally while the AI provides minimal backchannel feedback
   - Receive structured feedback after your target duration

## Configuration

### ElevenLabs Agent Setup

1. Create a conversational agent in [ElevenLabs](https://elevenlabs.io)
2. Copy your Agent ID from the agent settings
3. Update `coach-app/lib/config.js`:
```javascript
export const ELEVEN_AGENT_ID = "your_agent_id_here";
```

### Environment Variables (Optional)
Copy `.env.example` to `.env` and configure:
```bash
ELEVENLABS_API_KEY=sk-your_api_key
ELEVENLABS_AGENT_ID=agent_your_agent_id
```

## Project Structure

```
coachAI/
├── coach-app/           # React Native app (main application)
│   ├── App.js          # Main app component with UI and conversation logic
│   ├── index.js        # App entry point
│   ├── package.json    # Dependencies and scripts
│   ├── metro.config.js # Metro bundler configuration
│   ├── .env.example    # Environment variables template
│   ├── assets/         # App icons and images
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── adaptive-icon.png
│   │   └── favicon.png
│   └── lib/            # Utility modules
│       ├── config.js   # ElevenLabs agent configuration
│       ├── voice.web.js    # Web voice integration
│       └── voice.native.js # Native voice placeholder
└── README.md           # Project documentation
```

### Key Dependencies
- `@elevenlabs/react`: ElevenLabs React SDK for voice conversations
- `expo`: React Native development platform
- `react-native-webrtc`: WebRTC support for real-time communication

## Development

### Available Scripts
```bash
# Start development server
npm start
# or
npx expo start

# Run on specific platforms
npx expo start --web    # Web browser
npx expo start --ios    # iOS simulator  
npx expo start --android # Android emulator

# Build for production
npx expo build
```

### Testing Voice Features
- Voice interaction currently works best on **web platform**
- Ensure microphone permissions are granted
- Use Chrome/Firefox for best WebRTC compatibility
- Native mobile voice features are placeholder (will be implemented later)

## License

MIT License - see LICENSE file for details

