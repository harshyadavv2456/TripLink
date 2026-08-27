import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage path for persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStoredData() {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse stored data, using fallback:', e);
    }
  }
  return null;
}

function writeStoredData(data: any) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write stored data:', e);
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Data API: Get all stored data
app.get('/api/data', (req: Request, res: Response) => {
  const data = readStoredData();
  res.json({ success: true, data });
});

// Data API: Sync full state
app.post('/api/data', (req: Request, res: Response) => {
  const { trips, user, packingTemplates } = req.body;
  const payload = {
    trips: trips || [],
    user: user || null,
    packingTemplates: packingTemplates || [],
    updatedAt: new Date().toISOString(),
  };
  writeStoredData(payload);
  res.json({ success: true, data: payload });
});

// ----------------------------------------------------
// GEMINI AI ENDPOINTS
// ----------------------------------------------------

/**
 * 1. AI Full Itinerary Generator
 * Calls Gemini 3.7 Flash with trip wizard inputs + visited places list to ensure no duplicates.
 */
app.post('/api/gemini/generate-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      title,
      destinations,
      startDate,
      endDate,
      travelerCount,
      budget,
      styleTags,
      visitedPlaces = [],
      customNotes,
    } = req.body;

    const visitedListStr = Array.isArray(visitedPlaces) && visitedPlaces.length > 0
      ? visitedPlaces.map((v: any) => `- ${v.name} (${v.city}, ${v.country}): rated ${v.rating || 5}/5. Note: "${v.memory || 'visited'}"`).join('\n')
      : 'None recorded yet.';

    const destinationsStr = Array.isArray(destinations)
      ? destinations.map((d: any) => `${d.city}, ${d.country}${d.days ? ` (${d.days} days)` : ''}`).join(' -> ')
      : 'Selected destinations';

    const systemPrompt = `You are TripLink's master travel curator and itinerary designer.
You create immersive, highly realistic, day-by-day travel itineraries.
Your differentiator is that you link journeys intelligently and NEVER re-suggest any place the user has already visited.

CRITICAL INSTRUCTION - USER'S ALREADY VISITED PLACES:
The user has previously visited the following places. YOU MUST NOT SUGGEST OR INCLUDE ANY OF THESE PLACES IN THE NEW PLAN:
${visitedListStr}

Guidelines:
1. Provide a realistic schedule with 3 time blocks per day: morning, afternoon, evening.
2. For each activity: Provide place name, city/neighborhood location, category (food, sightseeing, adventure, relaxation, culture, transport, shopping, nature), approximate estimated cost in USD, a compelling 1-sentence reason why it matches their style tags (${Array.isArray(styleTags) ? styleTags.join(', ') : 'general'}), estimated travel time and distance to the next stop, and approximate latitude and longitude coordinates.
3. Keep pace and route geography realistic between consecutive stops.
4. Total itinerary must cover the full dates from ${startDate} to ${endDate}.`;

    const userPrompt = `Create a complete day-by-day travel itinerary for:
Trip: ${title || 'Adventure'}
Destinations: ${destinationsStr}
Dates: ${startDate} to ${endDate}
Travelers: ${travelerCount || 2}
Total Budget: $${budget || 3000} USD
Travel Styles: ${Array.isArray(styleTags) ? styleTags.join(', ') : 'discovery'}
Special requests: ${customNotes || 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                  title: { type: Type.STRING, description: 'Captivating theme for the day' },
                  destination: { type: Type.STRING, description: 'City, Country' },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeBlock: { type: Type.STRING, description: 'morning, afternoon, or evening' },
                        time: { type: Type.STRING, description: 'e.g. 09:00 AM' },
                        name: { type: Type.STRING, description: 'Name of venue, monument, or experience' },
                        location: { type: Type.STRING, description: 'Street address or neighborhood' },
                        category: { type: Type.STRING, description: 'food, sightseeing, adventure, relaxation, culture, transport, shopping, or nature' },
                        estCost: { type: Type.NUMBER, description: 'Estimated cost in USD' },
                        reason: { type: Type.STRING, description: 'Short reason why it fits the traveler style' },
                        travelTimeToNext: { type: Type.STRING, description: 'e.g. 15 min walk, 20 min metro' },
                        distanceToNext: { type: Type.STRING, description: 'e.g. 1.2 km' },
                        notes: { type: Type.STRING, description: 'Insider tips or booking advice' },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                      },
                      required: ['timeBlock', 'time', 'name', 'location', 'category', 'estCost', 'reason'],
                    },
                  },
                },
                required: ['dayNumber', 'date', 'title', 'destination', 'activities'],
              },
            },
          },
          required: ['days'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating itinerary with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate itinerary' });
  }
});

/**
 * 2. AI Single Day Regenerator
 * Re-generates only one specific day in context of previous/next days and visited places.
 */
app.post('/api/gemini/regenerate-day', async (req: Request, res: Response) => {
  try {
    const {
      tripTitle,
      destination,
      dayNumber,
      date,
      styleTags,
      previousDaySummary,
      nextDaySummary,
      visitedPlaces = [],
      focusPrompt,
    } = req.body;

    const visitedListStr = Array.isArray(visitedPlaces) && visitedPlaces.length > 0
      ? visitedPlaces.map((v: any) => `- ${v.name} (${v.city}, ${v.country})`).join('\n')
      : 'None';

    const systemPrompt = `You are TripLink's itinerary optimizer.
The user wants to REGENERATE A SINGLE DAY (Day ${dayNumber}) for their trip to ${destination}.

Context:
- Previous day plan: ${previousDaySummary || 'Arrival / Start'}
- Next day plan: ${nextDaySummary || 'Departure / Next destination'}
- Traveler style: ${Array.isArray(styleTags) ? styleTags.join(', ') : 'balanced'}
- Specific user adjustment focus: ${focusPrompt || 'Provide fresh, vibrant, alternative activities'}

CRITICAL: Do NOT suggest any places already visited:
${visitedListStr}

Provide a completely refreshed 3-part plan (morning, afternoon, evening) that flows seamlessly with the adjacent days.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Regenerate Day ${dayNumber} (${date}) in ${destination}. Focus: ${focusPrompt || 'Alternative exciting spots'}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Refreshed daily theme' },
            destination: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeBlock: { type: Type.STRING },
                  time: { type: Type.STRING },
                  name: { type: Type.STRING },
                  location: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estCost: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  travelTimeToNext: { type: Type.STRING },
                  distanceToNext: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ['timeBlock', 'time', 'name', 'location', 'category', 'estCost', 'reason'],
              },
            },
          },
          required: ['title', 'activities'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error regenerating day with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to regenerate day' });
  }
});

/**
 * 3. AI Smart Packing List Generator
 * Tailors items by destination climate, trip length, and traveler style tags.
 */
app.post('/api/gemini/generate-packing-list', async (req: Request, res: Response) => {
  try {
    const { destinations, startDate, durationDays, styleTags } = req.body;

    const destStr = Array.isArray(destinations)
      ? destinations.map((d: any) => `${d.city}, ${d.country}`).join(', ')
      : 'Travel destinations';

    const systemPrompt = `You are a professional travel outfitter and packing specialist.
Generate a comprehensive, hyper-practical packing list tailored to:
- Destinations: ${destStr}
- Dates/Season: Starting ${startDate || 'upcoming'}, duration ${durationDays || 5} days
- Trip Style: ${Array.isArray(styleTags) ? styleTags.join(', ') : 'general'}

Group items into categories: clothing, toiletries, electronics, documents, essentials, gear.
Include realistic item quantities where appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Create a customized packing checklist for ${durationDays || 5} days in ${destStr}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTitle: { type: Type.STRING },
            climateSummary: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'clothing, toiletries, electronics, documents, essentials, or gear' },
                  quantity: { type: Type.INTEGER },
                },
                required: ['name', 'category'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating packing list with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate packing list' });
  }
});

/**
 * 4. AI Trip Summary / Journal Story Generator
 * Summarizes ratings, place memories, and visited stops into a cohesive magazine paragraph.
 */
app.post('/api/gemini/summarize-journal', async (req: Request, res: Response) => {
  try {
    const { tripTitle, destinations, visitedPlacesWithMemories, userNotes } = req.body;

    const placesStr = Array.isArray(visitedPlacesWithMemories)
      ? visitedPlacesWithMemories.map((p: any) => `- ${p.name} in ${p.city || ''} (Rating: ${p.rating || 5}/5): "${p.memory || p.notes || 'Memorable experience'}"`).join('\n')
      : 'Key destinations and local spots.';

    const systemPrompt = `You are an acclaimed travel writer for Conde Nast Traveler and National Geographic.
Write an evocative, cohesive, 1-to-2 paragraph travel story/journal summary that brings to life the user's completed journey.
Synthesize the specific places visited, traveler memories, and ratings into an elegant narrative.`;

    const userPrompt = `Trip: ${tripTitle}
Destinations: ${JSON.stringify(destinations)}
Highlights & Memories:
${placesStr}
Additional Traveler Notes: ${userNotes || 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Evocative story headline' },
            summaryParagraph: { type: Type.STRING, description: 'Cohesive travel narrative paragraph' },
            keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['title', 'summaryParagraph'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error summarizing trip journal with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to summarize journal' });
  }
});

/**
 * 5. AI Natural Prompt-to-Journey Generator
 * Parses any conversational user prompt (e.g. "5 days in Swiss Alps for $2500, luxury & hiking")
 * and generates a full trip with destinations, dates, budgets, style tags, and day-by-day itinerary.
 */
app.post('/api/gemini/prompt-to-journey', async (req: Request, res: Response) => {
  try {
    const { prompt, currency = 'USD', visitedPlaces = [] } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const visitedListStr = Array.isArray(visitedPlaces) && visitedPlaces.length > 0
      ? visitedPlaces.map((v: any) => `- ${v.name} (${v.city}, ${v.country})`).join('\n')
      : 'None recorded yet.';

    const todayStr = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are TripLink's instant AI journey architect.
The user will provide a free-form travel prompt. Your job is to extract their intent and generate a full, realistic, connected multi-day itinerary.

Current Reference Date: ${todayStr}
Target Base Currency: ${currency}

CRITICAL RULE - VISITED PLACES EXCLUSION:
The user has already visited these places in past trips. DO NOT suggest or include them:
${visitedListStr}

Guidelines:
1. Deduce realistic destinations (city, country, estimated days per stop, approximate coordinates).
2. Set logical upcoming start/end dates (e.g. starting within 2-4 weeks if unspecified, duration 3-10 days matching prompt).
3. Determine budget amount, style tags (e.g. 'food-focused', 'adventure', 'luxury', 'relaxed', 'cultural', 'nature', 'romantic'), and traveler count.
4. For every day, generate a compelling day theme and 3 sequenced activities (morning, afternoon, evening) with realistic names, locations, categories, estimated costs in ${currency}, style rationale, travel time to next stop, and approximate coordinates.
5. Provide a captivating Unsplash travel image URL representing the destination for cover photo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Generate a complete journey from this request: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Captivating trip title' },
            summary: { type: Type.STRING, description: 'Editorial journey overview' },
            startDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
            endDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
            budget: { type: Type.NUMBER, description: `Total budget in ${currency}` },
            travelerCount: { type: Type.INTEGER },
            coverImage: { type: Type.STRING, description: 'Curated high-res landscape travel photo URL' },
            styleTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'e.g. food-focused, cultural, nature, luxury, relaxed, adventure',
            },
            destinations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  city: { type: Type.STRING },
                  country: { type: Type.STRING },
                  days: { type: Type.INTEGER },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ['city', 'country'],
              },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                  title: { type: Type.STRING },
                  destination: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeBlock: { type: Type.STRING, description: 'morning, afternoon, or evening' },
                        time: { type: Type.STRING, description: 'e.g. 09:30 AM' },
                        name: { type: Type.STRING },
                        location: { type: Type.STRING },
                        category: { type: Type.STRING, description: 'food, sightseeing, adventure, relaxation, culture, transport, shopping, nature' },
                        estCost: { type: Type.NUMBER },
                        reason: { type: Type.STRING },
                        travelTimeToNext: { type: Type.STRING },
                        distanceToNext: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                      },
                      required: ['timeBlock', 'time', 'name', 'location', 'category', 'estCost', 'reason'],
                    },
                  },
                },
                required: ['dayNumber', 'date', 'title', 'destination', 'activities'],
              },
            },
          },
          required: ['title', 'summary', 'startDate', 'endDate', 'destinations', 'days', 'budget', 'styleTags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating prompt journey with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate journey from prompt' });
  }
});

/**
 * 6. AI Multimodal Booking & Receipt Screenshot Scanner
 * Analyzes uploaded screenshots of flight tickets (MakeMyTrip, Indigo, Emirates), hotel vouchers (Booking.com, Airbnb),
 * train/activity tickets and extracts all structured metadata for automatic 0-effort logging.
 */
app.post('/api/gemini/analyze-booking-screenshot', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const systemPrompt = `You are TripLink's smart document and booking scanner.
Analyze the provided screenshot/photo of a travel booking (e.g. MakeMyTrip flight ticket, Booking.com reservation, Airbnb confirmation, train ticket, activity pass, restaurant receipt, or rental).

Extract the following information with high accuracy:
- type: 'flight' | 'hotel' | 'train' | 'car' | 'ticket' | 'activity' | 'insurance' | 'other'
- provider: e.g. 'MakeMyTrip', 'Air India', 'Emirates', 'Booking.com', 'Airbnb', 'JR Pass', 'Expedia', 'Delta'
- title: clear summary like "Flight AI101: Delhi to Tokyo" or "3-Night Stay at Kyoto Grand Hotel"
- confirmationCode: PNR / Booking ID / E-Ticket Number if found (or "CONFIRMED")
- date: YYYY-MM-DD of departure or check-in
- time: e.g. "10:30 AM" or "Check-in 15:00"
- location: destination city / airport / address
- seatOrRoom: e.g. "Seat 14A", "Deluxe King Room", or "Car Class A"
- cost: numeric cost if indicated on ticket/receipt (or 0 if not shown)
- currency: detected currency code (USD, INR, EUR, JPY, GBP, etc.)
- expenseCategory: 'flights' | 'stay' | 'transit' | 'food' | 'activities' | 'shopping' | 'other'
- notes: important luggage allowance, terminal, check-in instructions, or gate info found`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: 'Analyze this travel booking screenshot and extract structured details.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'flight, hotel, train, car, ticket, activity, insurance, or other' },
            provider: { type: Type.STRING },
            title: { type: Type.STRING },
            confirmationCode: { type: Type.STRING },
            date: { type: Type.STRING, description: 'YYYY-MM-DD' },
            time: { type: Type.STRING },
            location: { type: Type.STRING },
            seatOrRoom: { type: Type.STRING },
            cost: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            expenseCategory: { type: Type.STRING, description: 'flights, stay, transit, food, activities, shopping, other' },
            notes: { type: Type.STRING },
          },
          required: ['type', 'provider', 'title', 'confirmationCode', 'date'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing booking screenshot with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze booking screenshot' });
  }
});

// ----------------------------------------------------
// VITE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripLink server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
