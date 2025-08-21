// lib/analysis.js
// AI analysis 

// Create analysis prompt 
function createAnalysisPrompt(sessionData) {
  const hasTranscript = sessionData.transcript && sessionData.transcript.length > 0;
  
  let prompt = `You are a professional public speaking coach analyzing a completed practice session. This was a real speaking practice session, not a video or hypothetical scenario.

SESSION DETAILS:
- Speaking Mode: ${sessionData.mode}
- Topic: "${sessionData.topic}"
- Duration: ${Math.floor(sessionData.duration/60)} minutes ${sessionData.duration%60} seconds
- Speaker: ${sessionData.speakerName || "Practitioner"}
- Focus Areas: ${sessionData.focusAreas.join(", ")}`;

  if (hasTranscript) {
    prompt += `
- Session Transcript: "${sessionData.transcript.join(' ')}"`;
  }

  prompt += `

IMPORTANT: This was an actual speaking practice session that just completed. Provide specific, actionable feedback based on the session details above.

Please provide coaching feedback in this exact format:

STRENGTHS:
- [List what went well in this practice session]

IMPROVEMENTS:
- [List specific areas to work on based on the focus areas: ${sessionData.focusAreas.join(", ")}]

NEXT STEPS:
- [Provide actionable suggestions for the next practice session]

SCORE: X/10

Keep feedback encouraging, specific, and actionable. Base your analysis on the actual session data provided, not hypothetical scenarios.`;

  return prompt;
}

export async function analyzeSession(sessionData) {
  try {
    // Try Hugging Face first 
    const hfResult = await tryHuggingFaceAnalysis(sessionData);
    if (hfResult) return hfResult;

    // Fallback to Gemini 
    const geminiResult = await tryGeminiAnalysis(sessionData);
    if (geminiResult) return geminiResult;

    // Check for OpenAI API key as last resort
    const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!openAIKey) {
      console.log("No API keys found, using demo analysis");
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
            content: 'You are an expert public speaking coach who analyzes completed practice sessions. Provide constructive, encouraging, and specific feedback based on actual session data. Never provide hypothetical or generic advice - always base your analysis on the specific session details provided.'
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
        let analysisText = data.choices[0].message.content;
        
        // Clean up markdown formatting for better readability
        analysisText = analysisText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
          .replace(/\*(.*?)\*/g, '$1')      // Remove *italic* formatting
          .replace(/`(.*?)`/g, '$1')        // Remove `code` formatting
          .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove _underline_ formatting
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
          .trim();
        
        return `AI Analysis via OpenAI

${analysisText}

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

// Try Hugging Face free inference API
async function tryHuggingFaceAnalysis(sessionData) {
  try {
    const hfKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
    if (!hfKey) return null;

    console.log("Requesting AI analysis from Hugging Face...");

    const prompt = createAnalysisPrompt(sessionData);
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data && data[0] && data[0].generated_text) {
        let analysisText = data[0].generated_text;
        
        // Clean up markdown formatting for better readability
        analysisText = analysisText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
          .replace(/\*(.*?)\*/g, '$1')      // Remove *italic* formatting
          .replace(/`(.*?)`/g, '$1')        // Remove `code` formatting
          .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove _underline_ formatting
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
          .trim();
        
        return `AI Analysis via Hugging Face

${analysisText}

Session Summary:
- Mode: ${sessionData.mode}
- Topic: "${sessionData.topic}"
- Duration: ${Math.floor(sessionData.duration/60)}:${String(sessionData.duration%60).padStart(2,'0')}
- Focus Areas: ${sessionData.focusAreas.join(", ")}

---
Powered by Hugging Face (DialoGPT)`;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("Hugging Face error:", response.status, errorData);
    }
    
    console.log("Hugging Face request failed, trying next option");
    return null;
  } catch (error) {
    console.error("Hugging Face analysis error:", error);
    return null;
  }
}

// Try Google Gemini
async function tryGeminiAnalysis(sessionData) {
  try {
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!geminiKey) return null;

    console.log("Requesting AI analysis from Google Gemini...");

    const prompt = createAnalysisPrompt(sessionData);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert public speaking coach. You analyze completed practice sessions and provide constructive feedback. Always base your analysis on the actual session data provided, never on hypothetical scenarios.

${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        let analysisText = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown formatting for better readability
        analysisText = analysisText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
          .replace(/\*(.*?)\*/g, '$1')      // Remove *italic* formatting
          .replace(/`(.*?)`/g, '$1')        // Remove `code` formatting
          .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove _underline_ formatting
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
          .trim();
        
        return `AI Analysis via Google Gemini

${analysisText}

Session Summary:
- Mode: ${sessionData.mode}
- Topic: "${sessionData.topic}"
- Duration: ${Math.floor(sessionData.duration/60)}:${String(sessionData.duration%60).padStart(2,'0')}
- Focus Areas: ${sessionData.focusAreas.join(", ")}

---
Powered by Google Gemini`;
      }
    }
    
    console.log("Gemini request failed, trying next option");
    return null;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
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
