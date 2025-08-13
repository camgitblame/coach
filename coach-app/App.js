// coach-app/App.js
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Platform, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useConversation } from "@elevenlabs/react";

// agent id
const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? "agent_0501k2cak0jhfavb7vgqaghpfeb1";
const CONNECTION_TYPE = "webrtc";

const MODES = [
  { key: "elevator", label: "Elevator Pitch", hint: "Explain who you are, what you do, and why it matters." },
  { key: "lightning", label: "Lightning Talk", hint: "Share one idea clearly in under 2 minutes." },
  { key: "demo", label: "Product Demo", hint: "Hook, problem, solution, and a simple call to action." },
  { key: "update", label: "Project Update", hint: "Status, impact, risks, and next steps." },
  { key: "defense", label: "Thesis Defense", hint: "Core claim, evidence, limitations, future work." },
];

const DEFAULT_FOCUS = ["Clarity", "Structure", "Pace", "Filler Words"];

export default function App() {
  const [modeKey, setModeKey] = useState("elevator");
  const [topic, setTopic] = useState("");
  const [userName, setUserName] = useState("");
  const [durationSec, setDurationSec] = useState(120);
  const [focusAreas, setFocusAreas] = useState(DEFAULT_FOCUS);
  const [transcript, setTranscript] = useState([]);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  
  const convo = useConversation({
    onConnect: () => console.log("connected"),
    onDisconnect: () => console.log("disconnected"),
    onMessage: m => m?.text && setTranscript(t => [...t, m.text]),
    onError: e => console.error("Agent error:", e),
    onConnectionStateChange: s => console.log("connection:", s),
  });

  const mode = useMemo(() => MODES.find(m => m.key === modeKey) || MODES[0], [modeKey]);

  useEffect(() => {
    if (convo.status === "connected") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [convo.status]);

  function toggleFocus(item) {
    setFocusAreas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  }

  function incDuration(delta) {
    setDurationSec(d => Math.max(30, Math.min(600, d + delta)));
  }

  async function onBegin() {
    if (Platform.OS !== "web") {
      alert("Voice is enabled on web in this build.");
      return;
    }
    setTranscript([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert("Please allow microphone access.");
      return;
    }

    await convo.startSession({
      agentId: AGENT_ID,
      connectionType: CONNECTION_TYPE,
      metadata: {
        context: {
          speaker_name: userName || "Speaker",
          mode: mode.label,
          topic: topic || mode.hint,
          duration_sec: durationSec || 120,
          focus_areas: focusAreas?.length ? focusAreas : DEFAULT_FOCUS,
        }
      }
    });

    // Non-interrupting context 
    const ctx = {
      speaker_name: userName || "Speaker",
      mode: mode.label,
      topic: topic || mode.hint,
      duration_sec: durationSec || 120,
      focus_areas: focusAreas?.length ? focusAreas : DEFAULT_FOCUS,
    };
    await convo.sendContextualUpdate?.(`[SESSION_CONTEXT] ${JSON.stringify(ctx)}`);
  }


  async function onEnd() {
    await convo.endSession();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e0e0e" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "600", marginBottom: 4 }}>
          CoachAI
        </Text>
        <Text style={{ color: "#bdbdbd", marginBottom: 16 }}>
          Public Speaking practice with AI feedback.
        </Text>

        {/* Config */}
        <View style={{ backgroundColor: "#171717", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: "white", marginBottom: 6 }}>Mode</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m.key}
                onPress={() => setModeKey(m.key)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: modeKey === m.key ? "#4c8bf5" : "#2a2a2a",
                }}
              >
                <Text style={{ color: "white" }}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: "white", marginTop: 12 }}>Topic</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder={mode.hint}
            placeholderTextColor="#888"
            style={{
              marginTop: 6, backgroundColor: "#242424", borderRadius: 8, color: "white",
              paddingHorizontal: 10, paddingVertical: 8,
            }}
          />

          <Text style={{ color: "white", marginTop: 12 }}>Your name</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Optional"
            placeholderTextColor="#888"
            style={{
              marginTop: 6, backgroundColor: "#242424", borderRadius: 8, color: "white",
              paddingHorizontal: 10, paddingVertical: 8,
            }}
          />

          <Text style={{ color: "white", marginTop: 12 }}>Duration target</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
            <TouchableOpacity onPress={() => incDuration(-30)} style={{ backgroundColor: "#2a2a2a", padding: 8, borderRadius: 8 }}>
              <Text style={{ color: "white" }}>-30s</Text>
            </TouchableOpacity>
            <Text style={{ color: "white" }}>
              {Math.floor(durationSec / 60)} min {String(durationSec % 60).padStart(2, "0")}s
            </Text>
            <TouchableOpacity onPress={() => incDuration(30)} style={{ backgroundColor: "#2a2a2a", padding: 8, borderRadius: 8 }}>
              <Text style={{ color: "white" }}>+30s</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: "white", marginTop: 12 }}>Focus areas</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {DEFAULT_FOCUS.map(f => {
              const active = focusAreas.includes(f);
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => toggleFocus(f)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: active ? "#4caf50" : "#2a2a2a",
                  }}
                >
                  <Text style={{ color: "white" }}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Controls */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {convo.status === "connected" ? (
            <TouchableOpacity
              onPress={onEnd}
              style={{ backgroundColor: "#c84b4b", padding: 12, borderRadius: 8 }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>End Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onBegin}
              style={{ backgroundColor: "#4c8bf5", padding: 12, borderRadius: 8 }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Begin Coaching</Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              flex: 1,
              backgroundColor: "#171717",
              borderRadius: 8,
              padding: 10,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white" }}>
              Status: {convo.status}  |  Speaking: {convo.isSpeaking ? "yes" : "no"}
            </Text>
          </View>
        </View>


        {/* Session HUD */}
        <View style={{ backgroundColor: "#171717", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: "white", fontWeight: "600" }}>Session</Text>
          <Text style={{ color: "#bdbdbd", marginTop: 4 }}>
            Elapsed: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / Target: {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
          </Text>
          <Text style={{ color: "#bdbdbd", marginTop: 4 }}>
            Mode: {mode.label}  |  Focus: {focusAreas.join(", ")}
          </Text>
          <Text style={{ color: "#bdbdbd", marginTop: 4 }}>
            Topic: {topic || mode.hint}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
