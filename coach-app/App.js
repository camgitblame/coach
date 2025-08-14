// coach-app/App.js
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Platform, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useConversation } from "@elevenlabs/react";
import Svg, { Path } from "react-native-svg";

// ===== THEME 
const theme = {
  bg: "#0e0e0e",
  card: "#141414",
  cardAlt: "#171717",
  stroke: "#202020",
  text: "#eaeaea",
  textDim: "#bdbdbd",
  textMute: "#8a8a8a",
  primary: "#4c8bf5",
  primaryHover: "#5a96f6",
  success: "#4caf50",
  danger: "#c84b4b",
  input: "#232323",
  radius: 12,
  radiusSm: 8,
  space2: 8,
  space3: 12,
  space4: 16,
};

// ===== UI ATOMS 
function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

function Button({ children, onPress, variant="primary", style, disabled }) {
  const bgByVariant = {
    primary: theme.primary,
    danger: theme.danger,
    neutral: "#2a2a2a",
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: bgByVariant, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
}

function Chip({ active, onPress, children, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? theme.success : "#2a2a2a" },
        style,
      ]}
    >
      <Text style={styles.chipText}>{children}</Text>
    </TouchableOpacity>
  );
}

function Pill({ label, value }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

// ===== ICON
function LogoIcon({ size = 24, color = theme.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2v-3z"
        fill={color}
      />
    </Svg>
  );
}

// ===== AGENT CONFIG
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

// ===== APP
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <LogoIcon />
          <Text style={styles.title}>PS Coach</Text>
        </View>
        <Text style={styles.subtitle}>Public speaking practice with AI feedback</Text>

        <View style={styles.divider} />

        {/* Config */}
        <Card>
          <Text style={styles.sectionLabel}>Mode</Text>
          <View style={styles.rowWrap}>
            {MODES.map(m => (
              <Chip
                key={m.key}
                active={modeKey === m.key}
                onPress={() => setModeKey(m.key)}
                style={{ marginRight: theme.space2, marginBottom: theme.space2 }}
              >
                {m.label}
              </Chip>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: theme.space3 }]}>Topic</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder={mode.hint}
            placeholderTextColor={theme.textMute}
            style={styles.input}
          />

          <Text style={[styles.sectionLabel, { marginTop: theme.space3 }]}>Your name</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Optional"
            placeholderTextColor={theme.textMute}
            style={styles.input}
          />

          <Text style={[styles.sectionLabel, { marginTop: theme.space3 }]}>Duration target</Text>
          <View style={styles.rowBetween}>
            <Button variant="neutral" onPress={() => incDuration(-30)}>-30s</Button>
            <Text style={styles.durationText}>
              {Math.floor(durationSec / 60)} min {String(durationSec % 60).padStart(2, "0")}s
            </Text>
            <Button variant="neutral" onPress={() => incDuration(30)}>+30s</Button>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: theme.space3 }]}>Focus areas</Text>
          <View style={styles.rowWrap}>
            {DEFAULT_FOCUS.map(f => (
              <Chip
                key={f}
                active={focusAreas.includes(f)}
                onPress={() => toggleFocus(f)}
                style={{ marginRight: theme.space2, marginBottom: theme.space2 }}
              >
                {f}
              </Chip>
            ))}
          </View>
        </Card>

        <View style={styles.divider} />

        {/* Controls */}
        <View style={styles.controlsRow}>
          {convo.status === "connected" ? (
            <Button variant="danger" onPress={onEnd}>End Session</Button>
          ) : (
            <Button onPress={onBegin}>Begin Coaching</Button>
          )}

          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Pill label="Status" value={convo.status} />
              <Pill label="Speaking" value={convo.isSpeaking ? "yes" : "no"} />
            </View>
          </Card>
        </View>

        {/* Session HUD */}
        <Card>
          <Text style={styles.hudTitle}>Session</Text>
          <Text style={styles.hudLine}>
            Elapsed: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            {"  "} / {"  "}
            Target: {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
          </Text>
          <Text style={styles.hudLine}>Mode: {mode.label}{"  "} | {"  "}Focus: {focusAreas.join(", ")}</Text>
          <Text style={styles.hudLine}>Topic: {topic || mode.hint}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== STYLES
const styles = StyleSheet.create({
  container: {
    padding: theme.space4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "600",
    marginLeft: theme.space2,
  },
  subtitle: {
    color: theme.textDim,
    marginBottom: theme.space4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.stroke,
    marginVertical: theme.space3,
  },
  card: {
    backgroundColor: theme.cardAlt,
    borderRadius: theme.radius,
    padding: theme.space3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.stroke,
  },
  sectionLabel: {
    color: theme.text,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    marginTop: 6,
    backgroundColor: theme.input,
    borderRadius: theme.radiusSm,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.stroke,
  },
  rowBetween: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radiusSm,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radiusSm,
  },
  chipText: {
    color: "white",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: theme.space3,
  },
  statusCard: {
    flex: 1,
    marginLeft: theme.space2,
    justifyContent: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    backgroundColor: "#1e1e1e",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.stroke,
    marginRight: theme.space2,
  },
  pillLabel: {
    color: theme.textMute,
    fontSize: 12,
  },
  pillValue: {
    color: theme.text,
    fontWeight: "600",
    fontSize: 12,
  },
  durationText: {
    color: theme.text,
    fontWeight: "600",
  },
  hudTitle: {
    color: theme.text,
    fontWeight: "600",
  },
  hudLine: {
    color: theme.textDim,
    marginTop: 4,
  },
});
