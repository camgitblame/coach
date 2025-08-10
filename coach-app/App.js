// coach-app/App.js
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, Alert } from "react-native";
import { connectToAgent } from "./lib/voice";

const API_BASE = "https://4363a9813ccd.ngrok-free.app"; // current ngrok URL

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const timer = useRef(null);
  const voiceCleanup = useRef(null);

  useEffect(() => {
    timer.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/metrics/current`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await res.json();
        setMetrics(data);
      } catch (e) {
        console.log("metrics fetch error", e);
      }
    }, 1500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const handleVoiceToggle = async () => {
    if (isVoiceConnected) {
      // Disconnect voice
      if (voiceCleanup.current) {
        voiceCleanup.current();
        voiceCleanup.current = null;
      }
      setIsVoiceConnected(false);
    } else {
      // Connect voice
      try {
        voiceCleanup.current = await connectToAgent();
        setIsVoiceConnected(true);
      } catch (error) {
        Alert.alert("Connection Error", String(error?.message || error));
      }
    }
  };

  const pace = metrics?.pace_s_per_km ?? 0;
  const paceStr = pace ? `${Math.floor(pace/60)}:${String(pace%60).padStart(2,"0")}/km` : "--";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0f19" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>AI Running Coach</Text>
        <View style={{ height: 16 }} />
        <Row>
          <Tile label="Heart Rate" value={metrics?.hr ?? "--"} suffix="bpm" />
          <Tile label="Pace" value={paceStr} />
        </Row>
        <View style={{ height: 12 }} />
        <Row>
          <Tile label="Cadence" value={metrics?.cadence ?? "--"} suffix="spm" />
          <Tile label="Distance" value={metrics?.distance_km?.toFixed?.(2) ?? "--"} suffix="km" />
        </Row>
        <View style={{ height: 24 }} />
        <TouchableOpacity
          style={{ 
            backgroundColor: isVoiceConnected ? "#ff5b5b" : "#5b8aff", 
            padding: 16, 
            borderRadius: 14, 
            alignItems: "center" 
          }}
          onPress={handleVoiceToggle}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {isVoiceConnected ? "Disconnect Voice Coach" : "Connect Voice Coach"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ children }) {
  return <View style={{ flexDirection: "row", gap: 12 }}>{children}</View>;
}

function Tile({ label, value, suffix }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#151a28", padding: 16, borderRadius: 14 }}>
      <Text style={{ color: "#9aa4bf", fontSize: 13 }}>{label}</Text>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginTop: 6 }}>
        {value}{suffix ? ` ${suffix}` : ""}
      </Text>
    </View>
  );
}
