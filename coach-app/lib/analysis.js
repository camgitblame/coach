// lib/analysis.js
// AI analysis using direct OpenAI API calls, fallback to demo analysis

// Create analysis prompt for OpenAI
function createAnalysisPrompt(sessionData) {
  return `As a professional public speaking coach, analyze this practice session and provide detailed feedback:

Session Details:
- Mode: ${sessionData.mode}
- Topic: "${sessionData.topic}"
- Duration: ${Math.floor(sessionData.duration/60)}:${String(sessionData.duration%60).padStart(2,'0')}
- Speaker: ${sessionData.speakerName || "Practitioner"}
- Focus Areas: ${sessionData.focusAreas.join(", ")}

Please provide coaching feedback in this format:

STRENGTHS:
- What went well in this practice session

IMPROVEMENTS:
- Specific areas to work on based on the focus areas

NEXT STEPS:
- Actionable suggestions for improvement

SCORE: X/10

Keep feedback encouraging, specific, and actionable.`;
}

export async function analyzeSession(sessionData) {
  try {
    // Check for OpenAI API key
    const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!openAIKey) {
      console.log("No OpenAI API key found, using demo analysis");
      return generateDemoAnalysis(sessionData);
    }

    console.log("Requesting AI analysis from OpenAI API...");

    // Create the analysis prompt
    const prompt = createAnalysisPrompt(sessionData);

    // Make direct API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert public speaking coach with years of experience helping people improve their presentation skills. Provide constructive, encouraging, and specific feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return `AI Analysis via OpenAI

${data.choices[0].message.content}

Session Summary:
- Mode: ${sessionData.mode}
- Topic: "${sessionData.topic}"
- Duration: ${Math.floor(sessionData.duration/60)}:${String(sessionData.duration%60).padStart(2,'0')}
- Focus Areas: ${sessionData.focusAreas.join(", ")}

---
Powered by OpenAI (gpt-3.5-turbo)`;
      } else {
        console.log("OpenAI response was empty, using demo analysis");
        return generateDemoAnalysis(sessionData);
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      
      if (response.status === 401) {
        return `OpenAI API Key Issue

Unable to authenticate with OpenAI API. Please check your API key.

${generateDemoAnalysis(sessionData)}`;
      }
      
      if (response.status === 429) {
        return `OpenAI Rate Limit Exceeded

You've reached your OpenAI API usage limit.

${generateDemoAnalysis(sessionData)}`;
      }
      
      // For any other error, fall back to demo analysis
      console.log("OpenAI request failed, using demo analysis");
      return generateDemoAnalysis(sessionData);
    }

  } catch (error) {
    console.error("OpenAI analysis error:", error);
    
    // For any other error, fall back to demo analysis
    console.log("OpenAI request failed, using demo analysis");
    return generateDemoAnalysis(sessionData);
  }
}

// Generate a comprehensive demo analysis based on session data
function generateDemoAnalysis(sessionData) {
  const duration = sessionData.duration;
  const focusAreas = sessionData.focusAreas;
  const mode = sessionData.mode;
  const topic = sessionData.topic;
  
  // Generate strengths based on focus areas
  const strengths = [];
  if (focusAreas.includes("Clarity")) {
    strengths.push("You maintained clear articulation throughout the session");
  }
  if (focusAreas.includes("Structure")) {
    strengths.push("Your content followed a logical flow from introduction to conclusion");
  }
  if (focusAreas.includes("Pace")) {
    strengths.push("You demonstrated good awareness of speaking rhythm");
  }
  if (focusAreas.includes("Body Language")) {
    strengths.push("Your posture and gestures supported your verbal message");
  }
  if (focusAreas.includes("Eye Contact")) {
    strengths.push("You maintained appropriate eye contact during delivery");
  }
  if (strengths.length === 0) {
    strengths.push("You completed the full practice session with dedication");
  }

  // Generate improvements based on focus areas
  const improvements = [];
  if (focusAreas.includes("Clarity")) {
    improvements.push("Work on enunciating key terms more distinctly");
  }
  if (focusAreas.includes("Structure")) {
    improvements.push("Consider adding clearer transitions between main points");
  }
  if (focusAreas.includes("Pace")) {
    improvements.push("Experiment with strategic pauses for emphasis");
  }
  if (focusAreas.includes("Body Language")) {
    improvements.push("Practice more purposeful hand gestures");
  }
  if (focusAreas.includes("Eye Contact")) {
    improvements.push("Try scanning different sections of your audience");
  }
  if (improvements.length === 0) {
    improvements.push("Focus on one specific skill area in your next session");
  }

  // Generate next steps
  const nextSteps = [
    `Practice the same topic for ${Math.ceil(duration / 60) + 1} minutes next time`,
    "Record yourself to review your delivery",
    `Focus specifically on ${focusAreas[0]?.toLowerCase() || "clarity"} in your next session`
  ];

  // Calculate score based on duration and engagement
  let score = 7; // Base score
  if (duration >= 120) score += 1; // Bonus for longer sessions
  if (focusAreas.length >= 3) score += 1; // Bonus for multiple focus areas
  if (duration >= 60) score += 1; // Bonus for completing at least 1 minute

  return `Demo Analysis

STRENGTHS:
${strengths.map(s => `- ${s}`).join('\n')}

IMPROVEMENTS:
${improvements.map(i => `- ${i}`).join('\n')}

NEXT STEPS:
${nextSteps.map(n => `- ${n}`).join('\n')}

SCORE: ${Math.min(score, 10)}/10

Session Summary:
- Mode: ${mode}
- Topic: "${topic}"
- Duration: ${Math.floor(duration/60)}:${String(duration%60).padStart(2,'0')}
- Focus Areas: ${focusAreas.join(", ")}

Great job completing your practice session! Consistent practice is the key to improvement.

---
Demo analysis mode - Connect Hugging Face API or OpenAI API for feedback`;
}
