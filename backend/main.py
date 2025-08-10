from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import random, time


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATE: Dict[str, Any] = {
    "user_id": "demo",
    "plan": {
        "session_type": "easy_run",
        "target_pace_s_per_km": 360,  # 6:00/km
        "duration_min": 30,
    },
    "last_metrics": {
        "hr": 120,
        "pace_s_per_km": 360,
        "cadence": 172,
        "rpe": 4,
        "distance_km": 0.0,
        "ts": time.time(),
    },
    "journal": [],  # List[Dict[str, Any]]
}


class PlanUpdate(BaseModel):
    sleep_hours: Optional[float] = None
    fatigue: Optional[int] = None  # 1-10
    soreness: Optional[int] = None  # 1-10


class LogEntry(BaseModel):
    type: str
    text: str
    metrics: Optional[Dict[str, Any]] = None


HR_MAX = 200


def _tick_metrics() -> Dict[str, Any]:
    m = STATE["last_metrics"].copy()
    m["hr"] = max(90, min(185, int(random.gauss(m["hr"], 2))))
    m["pace_s_per_km"] = max(300, min(480, int(random.gauss(m["pace_s_per_km"], 3))))
    m["cadence"] = max(150, min(190, int(random.gauss(m["cadence"], 1))))
    m["rpe"] = max(1, min(10, int(random.gauss(m["rpe"], 0.1))))
    m["distance_km"] = round(m["distance_km"] + random.uniform(0.01, 0.03), 3)
    m["ts"] = time.time()
    STATE["last_metrics"] = m
    return m


@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.get("/metrics/current")
async def get_metrics():
    return _tick_metrics()


@app.get("/plan/today")
async def get_today_plan():
    return STATE["plan"]


@app.post("/plan/update")
async def update_plan(update: PlanUpdate):
    # --- debug log
    print("update_plan payload:", update.dict())
    plan = STATE["plan"].copy()
    modifiers: List[str] = []

    if update.sleep_hours is not None and update.sleep_hours < 6:
        plan["duration_min"] = int(plan["duration_min"] * 0.8)
        plan["target_pace_s_per_km"] += 10
        modifiers.append("sleep<6h")

    if update.fatigue and update.fatigue >= 8:
        plan["duration_min"] = int(plan["duration_min"] * 0.8)
        modifiers.append("fatigue>=8")

    if update.soreness and update.soreness >= 7:
        plan["session_type"] = "recovery_jog"
        plan["target_pace_s_per_km"] += 15
        modifiers.append("soreness>=7")

    STATE["plan"] = plan
    return {"updated_plan": plan, "modifiers": modifiers}


@app.post("/journal/log")
async def log_entry(entry: LogEntry):
    # --- debug log
    print("log_entry payload:", entry.dict())
    STATE["journal"].append({"ts": time.time(), **entry.dict()})
    return {"ok": True}


# viewer for debug
@app.get("/journal")
async def get_journal():
    return STATE["journal"]
