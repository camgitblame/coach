#!/usr/bin/env bash
# Development Quick Start Guide

echo "CoachAI Dev Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "Please run this from the coachAI project root directory"
    exit 1
fi

echo "Current Status Check:"

# Check backend dependencies
echo -n "Backend dependencies: "
if [ -d "coach.venv" ] && [ -f "coach.venv/bin/activate" ]; then
    echo "Virtual environment ready"
else
    echo "Virtual environment missing"
    echo "Run: python3 -m venv coach.venv && source coach.venv/bin/activate && pip install -r backend/requirements.txt"
fi

# Check frontend dependencies
echo -n "Frontend dependencies: "
if [ -d "coach-app/node_modules" ]; then
    echo "Node modules installed"
else
    echo "Node modules missing"
    echo "Run: cd coach-app && npm install --legacy-peer-deps"
fi

# Check if backend is running
echo -n "Backend status: "
if curl -s http://localhost:8000/healthz > /dev/null 2>&1; then
    echo "Running on port 8000"
else
    echo "Not running"
    echo "   Start with: ./scripts/run_backend.sh"
fi

# Check if ngrok is running
echo -n "Ngrok tunnel: "
if pgrep ngrok > /dev/null; then
    echo "Active tunnel detected"
    echo "   Check URL with: curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'"
else
    echo "No tunnel detected"
    echo "   Start with: ./scripts/run_ngrok.sh"
fi

echo ""
echo "Quick Commands:"
echo "  Start backend:     ./scripts/run_backend.sh"
echo "  Start ngrok:       ./scripts/run_ngrok.sh"
echo "  Start React Native: cd coach-app && npx expo start"
echo "  Test API:          curl http://localhost:8000/healthz"
echo ""
echo "Full documentation: README.md"
