# CoachAI - Sports Training Assistant

A React Native app with FastAPI backend that provides real-time coaching with voice interaction using ElevenLabs AI.

## Setup


#### **Environment Setup** 
**Set Up**:
```bash
cd coachAI
rm -rf coach.venv
python3 -m venv coach.venv
source coach.venv/bin/activate
pip install -r backend/requirements.txt
```


### Backend Setup
```bash
./scripts/run_backend.sh
```

# In a new terminal

```bash
./scripts/run_ngrok.sh
```

### Update URL
Update the `API_BASE` URL in `coach-app/App.js` with ngrok URL.

### Frontend Setup
```bash
cd coach-app
npm install --legacy-peer-deps
npx expo start
```

## Configuration

### ElevenLabs Voice Setup

1. Create an agent in ElevenLabs and get your Agent ID
2. Get your API key from your account settings
3. Update `coach-app/lib/voice.js`:
```javascript
const ELEVENLABS_AGENT_ID = 'agent_id';
const ELEVENLABS_API_KEY = 'api_key';
```

## Project Structure

```
coachAI/
├── backend/          # FastAPI server
│   ├── main.py       # Main API endpoints
│   └── requirements.txt
├── coach-app/        # React Native app
│   ├── App.js        # Main app component
│   ├── lib/
│   │   └── voice.web.js
  # ElevenLabs integration
│   └── package.json
├── coach.venv/       # venv
└── scripts/          # Helper scripts
    ├── run_backend.sh
    └── run_ngrok.sh
```

## API Endpoints

- `GET /healthz` - Health check
- `GET /metrics/current` - Current training metrics
- `GET /plan/today` - Today's training plan
- `POST /plan/update` - Update plan based on user input
- `POST /journal/log` - Log training entries
- `GET /journal` - View training journal

## Dev Commands

```bash
# Start backend
./scripts/run_backend.sh

# Start ngrok tunnel
./scripts/run_ngrok.sh

# Test API
curl http://localhost:8000/healthz
curl http://localhost:8000/metrics/current

# Start React Native
cd coach-app
npx expo start
```

## Features
- **Real-time Metrics**: Heart rate, pace, cadence, distance tracking
- **Adaptive Training Plans**: Plans adjust based on sleep, fatigue, and soreness
- **Voice Coaching**: ElevenLabs AI-powered conversational coaching
- **Training Journal**: Log and track training sessions
- **Cross-platform**: Works on iOS, Android, and web

