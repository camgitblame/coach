import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Curated resources for each speaking mode
const CURATED_RESOURCES = {
  "Elevator Pitch": {
    books: [
      {
        title: "Talk Like TED",
        author: "Carmine Gallo",
        why: "Learn the 9 public speaking secrets of the world's top minds",
        url: "https://www.amazon.com/Talk-Like-TED-Public-Speaking-Secrets/dp/1250061539",
        thumbnail: "📚"
      },
      {
        title: "Pitch Anything",
        author: "Oren Klaff",
        why: "Master the art of pitching with a proven method for winning deals",
        url: "https://www.amazon.com/Pitch-Anything-Innovative-Presenting-Persuading/dp/0071752854",
        thumbnail: "📚"
      }
    ],
    videos: [
      {
        title: "How to Pitch Your Startup - Kevin Hale",
        description: "Learn how to present your startup idea to investors.",
        url: "https://www.youtube.com/watch?v=17XZGUX_9iM",
        thumbnail: "🎥"
      },
      {
        title: "The Secret to Successfully Pitching an Idea",
        description: "Three steps to pitch an idea.",
        url: "https://www.youtube.com/watch?v=l0hVIH3EnlQ",
        thumbnail: "🎥"
      }
    ],
    courses: [
      {
        name: "Successful Negotiation: Essential Strategies",
        platform: "Coursera",
        focus: "Master pitch techniques and persuasive communication",
        url: "https://www.coursera.org/learn/negotiation-skills",
        thumbnail: "🎓"
      }
    ],
    articles: [
      {
        title: "Tips for giving a powerful elevator pitch",
        author: "Harvard T.H. Chan School of Public Health",
        description: "A guide to creating an attention-grabbing pitch",
        url: "https://hsph.harvard.edu/research/health-communication/resources/elevator-pitch/",
        thumbnail: "📰"
      }
    ]
  },
  "Lightning Talk": {
    books: [
      {
        title: "Presentation Zen",
        author: "Garr Reynolds",
        why: "Simple ideas on presentation design and delivery for compelling talks",
        url: "https://www.amazon.com/Presentation-Zen-Simple-Design-Delivery/dp/0321811984",
        thumbnail: "📚"
      },
      {
        title: "The Quick and Easy Way to Effective Speaking",
        author: "Dale Carnegie",
        why: "Time-tested techniques for impactful short presentations",
        url: "https://a.co/d/47aztX1",
        thumbnail: "📚"
      }
    ],
    videos: [
      {
        title: "The Secret Structure of Great Talks",
        description: "Nancy Duarte reveals the hidden patterns in successful presentations",
        url: "https://www.youtube.com/watch?v=1nYFpuc2Umk",
        thumbnail: "🎥"
      },
      {
        title: "How to Speak So That People Want to Listen",
        description: "Julian Treasure shares powerful speaking techniques",
        url: "https://www.youtube.com/watch?v=eIho2S0ZahI",
        thumbnail: "🎥"
      }
    ],
    courses: [
      {
        name: "Introduction to Public Speaking",
        platform: "Coursera",
        focus: "Learn a proven framework for delivering impactful presentations",
        url: "https://www.coursera.org/learn/public-speaking",
        thumbnail: "🎓"
      }
    ],
    articles: [
      {
        title: "Lightning Talks and Ignite Talks: A Beginners Guide",
        author: "Samantha Pratt Lile",
        description: "Lightning talk tips and best practices",
        url: "https://www.beautiful.ai/blog/lightning-talks-and-ignite-talks-a-beginners-guide",
        thumbnail: "📰"
      }
    ]
  },
  "Product Demo": {
    books: [
      {
        title: "Just F*ing Demo!: Tactics For Leading Kickass Product Demos",
        author: "Rob Falcone",
        why: "Learn to deliver product demonstrations that close deals",
        url: "https://www.amazon.com/Demo-Deliver-Product-Demonstrations-Deals/dp/1734463104",
        thumbnail: "📚"
      },
      {
        title: "The Mom Test",
        author: "Rob Fitzpatrick",
        why: "Master customer conversations and effective product presentations",
        url: "https://www.amazon.com/Mom-Test-customers-business-everyone/dp/1492180742",
        thumbnail: "📚"
      }
    ],
    videos: [
      {
        title: "The secret to better product demos",
        description: "Y Combinator Partner advice for demos.",
        url: "https://www.youtube.com/shorts/rNPJKpmp3TM",
        thumbnail: "🎥"
      },
      {
        title: "iPhone 2007 Presentation",
        description: "Steve Jobs introduces the iPhone at Macworld 2007.",
        url: "https://www.youtube.com/watch?v=MnrJzXM7a6o",
        thumbnail: "🎥"
      }
    ],
    courses: [
      {
        name: "UMD: Product Management Fundamentals",
        platform: "edX",
        focus: "Learn to market products effectively",
        url: "https://www.edx.org/learn/product-management/the-university-of-maryland-college-park-product-management-fundamentals",
        thumbnail: "🎓"
      }
    ],
    articles: [
      {
        title: "How to Deliver the Perfect Product Demo",
        author: " Meredith Hart",
        description: "Best practices for showcasing your product",
        url: "https://blog.hubspot.com/sales/product-demo",
        thumbnail: "📰"
      }
    ]
  },
  "Project Update": {
    books: [
      {
        title: "No One Understands You and What to Do About It",
        author: "Heidi Grant Halvorson",
        why: "How to come across as you intend.",
        url: "https://www.amazon.com/One-Understands-You-What-About/dp/1625274122",
        thumbnail: "📚"
      },
      {
        title: "The Story Factor",
        author: "Annette Simmons",
        why: "How to use storytelling to persuade, motivate, and inspire in life and business.",
        url: "https://a.co/d/bjfFe8L",
        thumbnail: "📚"
      }
    ],
    videos: [
      {
        title: "What is a Daily Standup?",
        description: "Tips to help you through your first daily standup",
        url: "https://www.youtube.com/watch?v=iUjWjt4E6rs",
        thumbnail: "🎥"
      },
      {
        title: "How to Run Status Update Meetings",
        description: "Tips for status updates",
        url: "https://www.youtube.com/shorts/VqpjeAXPayM",
        thumbnail: "🎥"
      }
    ],
    courses: [
      {
        name: "Communication Skills for Engineers",
        platform: "Coursera",
        focus: "Master technical communication at work",
        url: "https://www.coursera.org/specializations/leadership-communication-engineers?utm_medium=sem&utm_source=gg&utm_campaign=b2c_apac_x_multi_ftcof_career-academy_cx_dr_bau_gg_pmax_gc_s2_all_m_hyb_24-08_desktop&campaignid=21573875733&adgroupid=&device=c&keyword=&matchtype=&network=x&devicemodel=&creativeid=&assetgroupid=6544910561&targetid=&extensionid=&placement=&gad_source=1&gad_campaignid=21584159401&gbraid=0AAAAADdKX6blsUQPyzbhtewPH4_j5Fl_l&gclid=Cj0KCQiA_8TJBhDNARIsAPX5qxS6-5lS4iZSplDIqyiiuD_2jD8aim0WkQJi18lbzPoXtzT-IAUJN6saAjVUEALw_wcB",
        thumbnail: "🎓"
      }
    ],
    articles: [
      {
        title: "How to Run a Better Status Meeting",
        author: "Project Management Institute",
        description: "Guidelines for impactful status meetings",
        url: "https://www.pmi.org/blog/run-an-effective-status-meeting",
        thumbnail: "📰"
      }
    ]
  },
  "Thesis Defense": {
    books: [
      {
        title: "How to Write a Thesis",
        author: "Umberto Eco",
        why: "The guide to researching and writing a thesis, by the bestselling author of The Name of the Rose",
        url: "https://www.amazon.com/How-Write-Thesis-MIT-Press/dp/0262527138",
        thumbnail: "📚"
      },
      {
        title: "Scientific Presentation Skills",
        author: "Martins Zaumanis",
        why: "How to Deliver Powerful Academic Presentations",
        url: "https://a.co/d/6qdffZF",
        thumbnail: "📚"
      }
    ],
    videos: [
      {
        title: "The Perfect Defense: The Oral Defense of a Dissertation",
        description: "Unlock the secrets to a flawless oral dissertation defense with Dr. Valerie Ballister",
        url: "https://www.youtube.com/watch?v=edQv9OKvfdU",
        thumbnail: "🎥"
      },
      {
        title: "10 mistakes to avoid when defending your thesis",
        description: "Top 10 mistakes to avoid when defending your thesis",
        url: "https://www.youtube.com/watch?v=_R3mloi2TsA",
        thumbnail: "🎥"
      }
    ],
    courses: [
      {
        name: "Good with Words: Speaking and Presenting Specialization",
        platform: "coursera",
        focus: "How to enhance the message you want to deliver",
        url: "https://www.coursera.org/specializations/good-with-words-speaking-presenting",
        thumbnail: "🎓"
      }
    ],
    articles: [
      {
        title: "How to Pull Off Your Thesis Defense With a Great Presentation",
        author: "Samantha Pratt Lile",
        description: "Tips to help you nail your presentation",
        url: "https://www.beautiful.ai/blog/how-to-pull-off-your-thesis-defense-with-a-great-presentation",
        thumbnail: "📰"
      }
    ]
  }
};

export async function createPracticeAgent(config) {
  const { mode, topic, focusAreas, userLevel, timeCommitment, userName } = config;

  if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert public speaking coach. Create a comprehensive practice plan for someone preparing for a ${mode}.

Topic: ${topic}
Speaker: ${userName || 'User'}
Focus Areas: ${focusAreas.join(', ')}
Skill Level: ${userLevel}
Daily Practice Time: ${timeCommitment} minutes

Generate a detailed 1-week practice plan with daily exercises and activities integrated into each day. 
Each day should include specific exercises to practice along with the daily focus area and activities.

Be specific, practical, and tailored to their level and focus areas.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Generate my personalized public speaking practice plan.'
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'practice_plan',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              practicePlan: {
                type: 'array',
                description: '1-week practice plan with daily sessions including exercises',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string', description: 'Day label (e.g., Day 1, Day 2)' },
                    focus: { type: 'string', description: 'Daily focus area' },
                    exercises: { type: 'string', description: 'Specific exercises to practice this day' },
                    activities: { type: 'string', description: 'Additional activities and goals for the day' }
                  },
                  required: ['day', 'focus', 'exercises', 'activities'],
                  additionalProperties: false
                }
              }
            },
            required: ['practicePlan'],
            additionalProperties: false
          }
        }
      },
      temperature: 0.3,
      max_tokens: 1500
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Inject curated resources based on mode
    const curatedResources = CURATED_RESOURCES[mode] || CURATED_RESOURCES["Elevator Pitch"];
    result.resources = curatedResources;
    
    return result;
  } catch (error) {
    console.error('Error creating practice plan:', error);
    throw error;
  }
}

export function formatAgentResponse(data) {
  if (!data) return { practicePlan: null, resources: null };

  return {
    practicePlan: data.practicePlan || null,
    resources: data.resources || null
  };
}
