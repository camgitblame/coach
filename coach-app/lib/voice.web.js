// coach-app/lib/voice.web.js
// Web voice integration using ElevenLabs React SDK.
// Provides a reusable hook for the Public Speaking Coach.

import { useConversation } from "@elevenlabs/react";
import { ELEVEN_AGENT_ID } from "./config";

export function useSpeakingCoachVoice({ onMessage }) {
  const convo = useConversation({
    onMessage: (m) => {
      if (m?.text && onMessage) onMessage(m.text);
    },
    onError: (e) => {
      // You can surface this to the UI if you prefer
      console.error("ElevenLabs conversation error:", e);
    },
  });

  async function start({ mode, topic, durationSec, focusAreas, userName }) {
    // mic permission
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // Context sent to the Agent
    const context = {
      roleplay: {
        persona: "Public Speaking Coach",
        mode,          
        topic,         
        durationSec,  
        focusAreas,    
        speakerName: userName || "Speaker",
      },
      guidance:
        "Act as a friendly but rigorous speaking coach. Outline a 20–40 second warmup, then cue the user to begin. While the user is speaking, stay mostly silent. Give only a brief backchannel about once every 20 seconds. After the duration target, stop the user politely and give concise feedback with 3 bullet points and 1 actionable next step. Keep replies short.",
      rubric:
        "Prioritize clarity, structure, pacing, and filler words. If focus areas are provided, weight feedback toward them. Never give medical, legal, or financial guidance.",
      format:
        "Use short paragraphs. When ending, ask if the user wants another round or a different mode.",
      disclaimer:
        "This is for practice and education.",
    };

    await convo.startSession({
      agentId: ELEVEN_AGENT_ID, 
      connectionType: "webrtc", 
      metadata: { context },
    });
  }

  async function stop() {
    await convo.endSession();
  }

  return {
    start,
    stop,
    status: convo.status,
    speaking: convo.isSpeaking,
  };
}
