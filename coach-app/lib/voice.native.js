// coach-app/lib/voice.native.js
export function useSpeakingCoachVoice() {
  async function start() {
    alert("Voice is enabled on web in this build. Native voice will be added later.");
  }
  async function stop() {}
  return { start, stop, status: "idle", speaking: false };
}
