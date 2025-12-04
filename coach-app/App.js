// coach-app/App.js
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Platform, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Linking, ActivityIndicator } from "react-native";
import { useConversation } from "@elevenlabs/react";
import Svg, { Path } from "react-native-svg";
import { analyzeSession } from "./lib/analysis";
import { createPracticeAgent, formatAgentResponse } from "./lib/practiceAgent";

// ===== THEME 
const theme = {
  bg: "#121212",
  surface: "#1e1e1e",
  surfaceVariant: "#2d2d2d",
  card: "#1e1e1e",
  cardElevated: "#242424",
  stroke: "#3d3d3d",
  strokeLight: "#4a4a4a",
  
  // Typography
  text: "#e0e0e0",
  textSecondary: "#b3b3b3",
  textTertiary: "#8a8a8a",
  
  primary: "#bb86fc",        
  primaryVariant: "#985eff", 
  primaryDark: "#9c64ff",
  accent: "#03dac6",         
  accentVariant: "#00b4a6",  
  
  // Status colors
  success: "#4caf50",
  warning: "#ff9800",
  error: "#cf6679",          
  
  // Input and interactive
  input: "#2d2d2d",
  inputFocused: "#3d3d3d",
  
  // spacing and radius
  elevation1: 1,
  elevation2: 2,
  elevation3: 4,
  elevation4: 8,
  radius: 16,              
  radiusMd: 12,
  radiusSm: 8,
  radiusXs: 4,
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
};

// ===== UI COMPONENTS 
function Card({ children, style, elevated = false }) {
  return (
    <View style={[
      styles.card, 
      elevated && styles.cardElevated,
      style
    ]}>
      {children}
    </View>
  );
}

function Button({ children, onPress, variant="primary", style, disabled, size="medium" }) {
  const getVariantStyles = () => {
    switch(variant) {
      case "primary":
        return {
          backgroundColor: theme.primary,
          color: "#000000"
        };
      case "accent":
        return {
          backgroundColor: theme.accent,
          color: "#000000"
        };
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderColor: theme.primary,
          borderWidth: 1,
          color: theme.primary
        };
      case "text":
        return {
          backgroundColor: "transparent",
          color: theme.primary
        };
      case "error":
        return {
          backgroundColor: theme.error,
          color: "#ffffff"
        };
      default:
        return {
          backgroundColor: theme.surfaceVariant,
          color: theme.text
        };
    }
  };

  const getSizeStyles = () => {
    switch(size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, minHeight: 48 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        sizeStyles,
        { 
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth || 0,
          opacity: disabled ? 0.6 : 1 
        },
        style,
      ]}
    >
      <Text style={[
        styles.buttonText, 
        { color: variantStyles.color }
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function Chip({ active, onPress, children, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: active ? theme.accent : theme.surfaceVariant,
          borderColor: active ? theme.accent : theme.strokeLight,
        },
        style,
      ]}
    >
      <Text style={[
        styles.chipText,
        { color: active ? "#000000" : theme.text }
      ]}>
        {children}
      </Text>
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

// ===== MATERIAL DESIGN ICON
function LogoIcon({ size = 24, color = theme.primary }) {
  return (
    <View style={{
      width: size + 8,
      height: size + 8,
      backgroundColor: theme.primary,
      borderRadius: (size + 8) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: theme.elevation2,
    }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2v-3z"
          fill="#000000"
        />
      </Svg>
    </View>
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

  // Analysis state
  const [sessionAnalysis, setSessionAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Practice Agent state
  const [showAgentResults, setShowAgentResults] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [userLevel, setUserLevel] = useState("intermediate");
  const [timeCommitment, setTimeCommitment] = useState(15);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);

  const convo = useConversation({
    onConnect: () => console.log("connected"),
    onDisconnect: () => console.log("disconnected"),
    onMessage: m => m?.text && setTranscript(t => [...t, m.text]),
    onError: e => console.error("Agent error:", e),
    onConnectionStateChange: s => console.log("connection:", s),
    onDebug: (message) => console.log("Debug:", message),
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
    
    // Clear previous session data
    setTranscript([]);
    setSessionAnalysis("");
    setIsAnalyzing(false);
    
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
    
    // Trigger analysis if we have session data
    if (transcript.length > 0 || elapsed > 10) {
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeSession({
          speakerName: userName,
          mode: mode.label,
          topic: topic || mode.hint,
          duration: elapsed,
          focusAreas: focusAreas,
          transcript: transcript,
        });
        setSessionAnalysis(analysis);
      } catch (error) {
        console.error("Analysis failed:", error);
        setSessionAnalysis("Analysis temporarily unavailable. Great job practicing!");
      } finally {
        setIsAnalyzing(false);
      }
    }
  }

  async function handleGeneratePlan() {
    if (!modeKey) {
      alert("Please select a speaking mode first");
      return;
    }
    
    if (focusAreas.length === 0) {
      alert("Please select at least one focus area");
      return;
    }

    setLoadingAgent(true);
    
    try {
      const result = await createPracticeAgent({
        mode: mode.label,
        topic,
        focusAreas,
        userLevel,
        timeCommitment,
        userName
      });
      
      const formatted = formatAgentResponse(result);
      setAgentData(formatted);
      setShowAgentResults(true);
    } catch (error) {
      console.error("Practice agent error:", error);
      alert("Failed to generate practice plan. Please check your OpenAI API key in .env file.");
    } finally {
      setLoadingAgent(false);
    }
  }

  function toggleBookmark(resource) {
    const resourceKey = `${resource.title}-${resource.url}`;
    const isBookmarked = bookmarkedResources.some(r => `${r.title}-${r.url}` === resourceKey);
    
    if (isBookmarked) {
      setBookmarkedResources(bookmarkedResources.filter(r => `${r.title}-${r.url}` !== resourceKey));
    } else {
      setBookmarkedResources([...bookmarkedResources, resource]);
    }
  }

  function isBookmarked(resource) {
    const resourceKey = `${resource.title}-${resource.url}`;
    return bookmarkedResources.some(r => `${r.title}-${r.url}` === resourceKey);
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
        <Card elevated>
          <Text style={styles.sectionLabel}>Speaking Mode</Text>
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

          <Text style={[styles.sectionLabel, { marginTop: theme.space5 }]}>Topic</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder={mode.hint}
            placeholderTextColor={theme.textTertiary}
            style={styles.input}
          />

          <Text style={[styles.sectionLabel, { marginTop: theme.space5 }]}>Your name</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Optional"
            placeholderTextColor={theme.textTertiary}
            style={styles.input}
          />

          <Text style={[styles.sectionLabel, { marginTop: theme.space5 }]}>Duration target</Text>
          <View style={styles.rowBetween}>
            <Button variant="outlined" size="small" onPress={() => incDuration(-30)}>-30s</Button>
            <Text style={styles.durationText}>
              {Math.floor(durationSec / 60)} min {String(durationSec % 60).padStart(2, "0")}s
            </Text>
            <Button variant="outlined" size="small" onPress={() => incDuration(30)}>+30s</Button>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: theme.space5 }]}>Focus areas</Text>
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

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Your Level</Text>
          <View style={styles.rowWrap}>
            {["beginner", "intermediate", "advanced"].map(level => (
              <Chip
                key={level}
                active={userLevel === level}
                onPress={() => setUserLevel(level)}
                style={{ marginRight: theme.space2, marginBottom: theme.space2 }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Chip>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: theme.space5 }]}>Daily Practice Time</Text>
          <View style={styles.rowWrap}>
            {[10, 15, 20, 30].map(time => (
              <Chip
                key={time}
                active={timeCommitment === time}
                onPress={() => setTimeCommitment(time)}
                style={{ marginRight: theme.space2, marginBottom: theme.space2 }}
              >
                {time} min
              </Chip>
            ))}
          </View>
        </Card>

        <View style={styles.divider} />

        {/* Practice Agent Button */}
        <Button 
          variant="accent" 
          size="large" 
          onPress={handleGeneratePlan}
          disabled={loadingAgent || convo.status === "connected"}
          style={{ marginBottom: theme.space4 }}
        >
          {loadingAgent ? "Generating Your Plan..." : "AI Practice Agent"}
        </Button>

        {/* Controls */}
        <View style={styles.controlsRow}>
          {convo.status === "connected" ? (
            <Button variant="error" size="large" onPress={onEnd}>End Session</Button>
          ) : (
            <Button variant="primary" size="large" onPress={onBegin}>Begin Coaching</Button>
          )}

          <Card style={styles.statusCard} elevated>
            <View style={styles.statusRow}>
              <Pill label="Status" value={convo.status} />
              <Pill label="Speaking" value={convo.isSpeaking ? "yes" : "no"} />
            </View>
          </Card>
        </View>

        {/* Session HUD */}
        <Card elevated>
          <Text style={styles.hudTitle}>Session Dashboard</Text>
          <View style={styles.hudMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Elapsed</Text>
              <Text style={styles.metricValue}>
                {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Target</Text>
              <Text style={styles.metricValue}>
                {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
              </Text>
            </View>
          </View>
          <View style={styles.hudDetails}>
            <Text style={styles.hudLine}>
              <Text style={styles.hudLabel}>Mode:</Text> {mode.label}
            </Text>
            <Text style={styles.hudLine}>
              <Text style={styles.hudLabel}>Focus:</Text> {focusAreas.join(", ")}
            </Text>
            <Text style={styles.hudLine}>
              <Text style={styles.hudLabel}>Topic:</Text> {topic || mode.hint}
            </Text>
          </View>
        </Card>

        {/* Session Analysis */}
        {(sessionAnalysis || isAnalyzing) && (
          <Card elevated>
            <Text style={styles.hudTitle}>✨ Session Analysis</Text>
            {isAnalyzing ? (
              <View style={styles.analysisLoading}>
                <Text style={styles.analysisLoadingText}>Analyzing your session...</Text>
                <Text style={styles.analysisSubtext}>This may take a few moments</Text>
              </View>
            ) : (
              <Text style={styles.analysisText}>{sessionAnalysis}</Text>
            )}
          </Card>
        )}

        {/* AI Practice Agent Loading */}
        {loadingAgent && (
          <Card elevated style={{ marginTop: theme.space4 }}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingTitle}>Generating Your Practice Plan...</Text>
            </View>
          </Card>
        )}

        {/* AI Practice Agent Results */}
        {showAgentResults && agentData && (
          <View style={{ marginTop: theme.space4 }}>
            {/* Header */}
            <Card elevated>
              <View style={styles.agentHeader}>
                <Text style={styles.agentTitle}>Your Personalized Practice Plan</Text>
                <TouchableOpacity 
                  onPress={() => setShowAgentResults(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.agentSubheader}>Powered by AI - Tailored to your goals</Text>
            </Card>

            {/* Exercises Cards */}
            {agentData.exercises && agentData.exercises.length > 0 && (
              <View style={{ marginTop: theme.space3 }}>
                <Text style={styles.sectionHeader}>Personalized Exercises</Text>
                {agentData.exercises.map((exercise, index) => (
                  <Card key={index} elevated style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.exerciseMeta}>
                        <View style={[
                          styles.difficultyBadge,
                          exercise.difficulty === 'Beginner' && styles.difficultyBeginner,
                          exercise.difficulty === 'Intermediate' && styles.difficultyIntermediate,
                          exercise.difficulty === 'Advanced' && styles.difficultyAdvanced,
                        ]}>
                          <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                        </View>
                        <Text style={styles.durationText}>⏱️ {exercise.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  </Card>
                ))}
              </View>
            )}

            {/* Practice Plan Cards */}
            {agentData.practicePlan && agentData.practicePlan.length > 0 && (
              <View style={{ marginTop: theme.space4 }}>
                <Card elevated>
                  <Text style={styles.sectionHeader}>1-Week Practice Plan</Text>
                  <Text style={styles.planSubheader}>Follow this progressive journey to master your {mode.label}</Text>
                  
                  {/* Progress Timeline */}
                  <View style={styles.timeline}>
                    {agentData.practicePlan.map((day, index) => (
                      <View key={index} style={styles.timelineItem}>
                        {/* Timeline Node */}
                        <View style={styles.timelineNodeContainer}>
                          <View style={styles.timelineNode}>
                            <Text style={styles.timelineNodeText}>{index + 1}</Text>
                          </View>
                          {index < agentData.practicePlan.length - 1 && (
                            <View style={styles.timelineConnector} />
                          )}
                        </View>
                        
                        {/* Day Content */}
                        <View style={styles.timelineContent}>
                          <View style={styles.timelineDayHeader}>
                            <Text style={styles.timelineDayLabel}>{day.day}</Text>
                            <View style={styles.timelineFocusBadge}>
                              <Text style={styles.timelineFocusText}>{day.focus}</Text>
                            </View>
                          </View>
                          
                          {day.exercises && (
                            <View style={styles.timelineSection}>
                              <Text style={styles.timelineSectionLabel}>🎯 Exercises</Text>
                              <Text style={styles.timelineSectionText}>{day.exercises}</Text>
                            </View>
                          )}
                          
                          <View style={styles.timelineSection}>
                            <Text style={styles.timelineSectionLabel}>📋 Activities</Text>
                            <Text style={styles.timelineSectionText}>{day.activities}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            )}

            {/* Resources Cards */}
            {agentData.resources && (
              <View style={{ marginTop: theme.space4 }}>
                <Text style={styles.sectionHeader}>Learning Resources</Text>

                {agentData.resources.books && agentData.resources.books.length > 0 && (
                  <View style={{ marginTop: theme.space2 }}>
                    <Text style={styles.resourceCategory}>Books</Text>
                    {agentData.resources.books.map((book, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => Linking.openURL(book.url)}
                        activeOpacity={0.7}
                      >
                        <Card elevated style={styles.resourceCard}>
                          <View style={styles.resourceContent}>
                            <Text style={styles.resourceThumbnail}>{book.thumbnail}</Text>
                            <View style={styles.resourceInfo}>
                              <Text style={styles.resourceTitle}>{book.title}</Text>
                              <Text style={styles.resourceAuthor}>by {book.author}</Text>
                              <Text style={styles.resourceWhy}>{book.why}</Text>
                            </View>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleBookmark({ ...book, type: 'book' });
                              }}
                              style={styles.bookmarkButton}
                            >
                              <Text style={styles.bookmarkIcon}>
                                {isBookmarked({ ...book, type: 'book' }) ? '★' : '☆'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {agentData.resources.videos && agentData.resources.videos.length > 0 && (
                  <View style={{ marginTop: theme.space3 }}>
                    <Text style={styles.resourceCategory}>Videos</Text>
                    {agentData.resources.videos.map((video, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => Linking.openURL(video.url)}
                        activeOpacity={0.7}
                      >
                        <Card elevated style={styles.resourceCard}>
                          <View style={styles.resourceContent}>
                            <Text style={styles.resourceThumbnail}>{video.thumbnail}</Text>
                            <View style={styles.resourceInfo}>
                              <Text style={styles.resourceTitle}>{video.title}</Text>
                              <Text style={styles.resourceWhy}>{video.description}</Text>
                            </View>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleBookmark({ ...video, type: 'video' });
                              }}
                              style={styles.bookmarkButton}
                            >
                              <Text style={styles.bookmarkIcon}>
                                {isBookmarked({ ...video, type: 'video' }) ? '★' : '☆'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {agentData.resources.courses && agentData.resources.courses.length > 0 && (
                  <View style={{ marginTop: theme.space3 }}>
                    <Text style={styles.resourceCategory}>Courses</Text>
                    {agentData.resources.courses.map((course, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => Linking.openURL(course.url)}
                        activeOpacity={0.7}
                      >
                        <Card elevated style={styles.resourceCard}>
                          <View style={styles.resourceContent}>
                            <Text style={styles.resourceThumbnail}>{course.thumbnail}</Text>
                            <View style={styles.resourceInfo}>
                              <Text style={styles.resourceTitle}>{course.name}</Text>
                              <Text style={styles.resourceAuthor}>{course.platform}</Text>
                              <Text style={styles.resourceWhy}>{course.focus}</Text>
                            </View>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleBookmark({ ...course, type: 'course' });
                              }}
                              style={styles.bookmarkButton}
                            >
                              <Text style={styles.bookmarkIcon}>
                                {isBookmarked({ ...course, type: 'course' }) ? '★' : '☆'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {agentData.resources.articles && agentData.resources.articles.length > 0 && (
                  <View style={{ marginTop: theme.space3 }}>
                    <Text style={styles.resourceCategory}>Articles</Text>
                    {agentData.resources.articles.map((article, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => Linking.openURL(article.url)}
                        activeOpacity={0.7}
                      >
                        <Card elevated style={styles.resourceCard}>
                          <View style={styles.resourceContent}>
                            <Text style={styles.resourceThumbnail}>{article.thumbnail}</Text>
                            <View style={styles.resourceInfo}>
                              <Text style={styles.resourceTitle}>{article.title}</Text>
                              <Text style={styles.resourceAuthor}>{article.author}</Text>
                              <Text style={styles.resourceWhy}>{article.description}</Text>
                            </View>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleBookmark({ ...article, type: 'article' });
                              }}
                              style={styles.bookmarkButton}
                            >
                              <Text style={styles.bookmarkIcon}>
                                {isBookmarked({ ...article, type: 'article' }) ? '★' : '☆'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Action Button */}
            <Card elevated style={{ marginTop: theme.space4 }}>
              <View style={styles.agentActions}>
                <Button 
                  variant="primary" 
                  size="large" 
                  onPress={() => {
                    setShowAgentResults(false);
                    onBegin();
                  }}
                  disabled={convo.status === "connected"}
                >
                  Start Practice Session
                </Button>
              </View>
            </Card>
          </View>
        )}

        {/* Credit Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Developed by{' '}
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://camgitblame.netlify.app/')}
              style={styles.linkContainer}
            >
              <Text style={styles.footerLink}>Cam Nguyen</Text>
            </TouchableOpacity>
            {' '}© 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====  STYLES
const styles = StyleSheet.create({
  container: {
    padding: theme.space4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.space2,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "500",
    marginLeft: theme.space3,
    letterSpacing: 0.25,
  },
  subtitle: {
    color: theme.textSecondary,
    fontSize: 16,
    marginBottom: theme.space6,
    lineHeight: 24,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.stroke,
    marginVertical: theme.space5,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: theme.space5,
    marginBottom: theme.space4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.stroke,
  },
  cardElevated: {
    backgroundColor: theme.cardElevated,
    elevation: theme.elevation2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sectionLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: theme.space2,
    letterSpacing: 0.15,
  },
  input: {
    backgroundColor: theme.input,
    borderRadius: theme.radiusSm,
    color: theme.text,
    paddingHorizontal: theme.space4,
    paddingVertical: theme.space3,
    borderWidth: 1,
    borderColor: theme.strokeLight,
    fontSize: 16,
    minHeight: 48,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.space2,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.space2,
  },
  button: {
    borderRadius: theme.radiusXs,
    alignItems: "center",
    justifyContent: "center",
    elevation: theme.elevation1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.25,
    textTransform: "uppercase",
  },
  chip: {
    paddingVertical: theme.space2,
    paddingHorizontal: theme.space3,
    borderRadius: theme.radius,
    borderWidth: 1,
    marginRight: theme.space2,
    marginBottom: theme.space2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: theme.space4,
    gap: theme.space3,
  },
  statusCard: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: theme.space3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  pill: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: theme.radius,
    paddingVertical: theme.space2,
    paddingHorizontal: theme.space3,
    borderWidth: 1,
    borderColor: theme.strokeLight,
    alignItems: "center",
    minWidth: 60,
  },
  pillLabel: {
    color: theme.textTertiary,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillValue: {
    color: theme.accent,
    fontWeight: "600",
    fontSize: 14,
    marginTop: 2,
  },
  durationText: {
    color: theme.text,
    fontWeight: "500",
    fontSize: 18,
    letterSpacing: 0.25,
  },
  hudTitle: {
    color: theme.text,
    fontWeight: "500",
    fontSize: 18,
    marginBottom: theme.space3,
    letterSpacing: 0.15,
  },
  hudMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.space4,
    backgroundColor: theme.surfaceVariant,
    borderRadius: theme.radiusMd,
    padding: theme.space4,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.stroke,
    marginHorizontal: theme.space3,
  },
  metricLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.space1,
  },
  metricValue: {
    color: theme.primary,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  hudDetails: {
    gap: theme.space2,
  },
  hudLine: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  hudLabel: {
    color: theme.text,
    fontWeight: "500",
  },
  analysisLoading: {
    alignItems: "center",
    paddingVertical: theme.space5,
  },
  analysisLoadingText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: theme.space2,
  },
  analysisSubtext: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  analysisText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.25,
    textAlign: "left",
  },
  
  // Loading UI
  loadingContainer: {
    padding: theme.space6,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "500",
    marginTop: theme.space4,
    textAlign: "center",
  },
  
  footer: {
    alignItems: "center",
    paddingVertical: theme.space6,
    marginTop: theme.space4,
    borderTopWidth: 1,
    borderTopColor: theme.stroke,
  },
  footerText: {
    color: theme.textTertiary,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flexDirection: "row",
    alignItems: "center",
  },
  linkContainer: {
    display: "inline",
  },
  footerLink: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textDecorationLine: "underline",
  },
  agentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space2,
  },
  agentTitle: {
    color: theme.primary,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.25,
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: theme.space3,
    paddingVertical: theme.space2,
    backgroundColor: theme.surfaceVariant,
    borderRadius: theme.radiusSm,
  },
  closeButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "500",
  },
  agentSubheader: {
    color: theme.textSecondary,
    fontSize: 13,
    marginBottom: theme.space4,
    lineHeight: 18,
  },
  agentSection: {
    marginBottom: theme.space5,
    paddingLeft: theme.space3,
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
  agentSectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: theme.space3,
    letterSpacing: 0.15,
  },
  agentSectionContent: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.25,
  },
  agentActions: {
    marginTop: theme.space4,
    paddingTop: theme.space4,
    borderTopWidth: 1,
    borderTopColor: theme.stroke,
  },
  
  // New card-based styles
  sectionHeader: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: theme.space3,
    letterSpacing: 0.25,
  },
  
  // Exercise Cards
  exerciseCard: {
    marginBottom: theme.space3,
    padding: theme.space4,
  },
  exerciseHeader: {
    marginBottom: theme.space3,
  },
  exerciseName: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: theme.space2,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space2,
  },
  difficultyBadge: {
    paddingHorizontal: theme.space3,
    paddingVertical: theme.space1,
    borderRadius: theme.radiusSm,
  },
  difficultyBeginner: {
    backgroundColor: "#4CAF50",
  },
  difficultyIntermediate: {
    backgroundColor: "#FF9800",
  },
  difficultyAdvanced: {
    backgroundColor: "#F44336",
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  durationText: {
    color: theme.textSecondary,
    fontSize: 13,
  },
  exerciseDescription: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Practice Plan Timeline
  planSubheader: {
    color: theme.textSecondary,
    fontSize: 14,
    marginBottom: theme.space4,
    lineHeight: 20,
  },
  timeline: {
    paddingTop: theme.space2,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: theme.space2,
  },
  timelineNodeContainer: {
    alignItems: "center",
    marginRight: theme.space3,
    width: 40,
  },
  timelineNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineNodeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  timelineConnector: {
    width: 3,
    flex: 1,
    backgroundColor: theme.accent,
    opacity: 0.3,
    marginTop: theme.space1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: theme.space4,
  },
  timelineDayHeader: {
    marginBottom: theme.space3,
  },
  timelineDayLabel: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: theme.space2,
  },
  timelineFocusBadge: {
    backgroundColor: theme.surfaceVariant,
    paddingHorizontal: theme.space3,
    paddingVertical: theme.space1 + 2,
    borderRadius: theme.radiusSm,
    alignSelf: "flex-start",
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
  timelineFocusText: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineSection: {
    marginBottom: theme.space3,
  },
  timelineSectionLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: theme.space1,
  },
  timelineSectionText: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Old Practice Plan Cards (kept for backwards compatibility)
  weekLabel: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: theme.space2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dayCard: {
    marginBottom: theme.space2,
    padding: theme.space3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space2,
  },
  dayLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  dayFocus: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "500",
  },
  dayActivities: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  dayExercises: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.space2,
  },
  dayExercisesLabel: {
    color: theme.accent,
    fontWeight: "600",
  },
  
  // Resource Cards
  resourceCategory: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: theme.space2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resourceCard: {
    marginBottom: theme.space3,
    padding: theme.space3,
  },
  resourceContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space3,
  },
  resourceThumbnail: {
    fontSize: 40,
    width: 60,
    textAlign: "center",
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: theme.space1,
  },
  resourceAuthor: {
    color: theme.textSecondary,
    fontSize: 13,
    marginBottom: theme.space2,
  },
  resourceWhy: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  bookmarkButton: {
    padding: theme.space2,
  },
  bookmarkIcon: {
    fontSize: 24,
    color: theme.accent,
  },
  
  // Quick Start
  quickStartLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: theme.space2,
  },
  quickStartItem: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: theme.space2,
  },
});
