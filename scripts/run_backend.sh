#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
[ ! -d coach.venv ] && python3 -m venv coach.venv
source coach.venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
