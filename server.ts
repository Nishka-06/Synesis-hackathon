import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Grounded Operational Assistant Endpoint
app.post('/api/gemini/ask', async (req, res) => {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!aiClient) {
    return res.json({
      answer: null,
      source: 'fallback',
      message: 'Gemini API key is not configured on server. Falling back to deterministic engine.',
    });
  }

  try {
    const prompt = `You are SmartFlow, an intelligent hospital operations and resource optimization assistant.
You strictly answer operational, capacity, throughput, billing, insurance, and discharge coordination questions based on the provided live hospital state data.
Rules:
- Rely strictly on the facts, numbers, and records present in the provided operational context.
- Never invent patient records, bed numbers, diagnoses, or clinical outcomes.
- Do not provide medical diagnoses or treatment recommendations.
- Keep answers concise, factual, actionable, and structured with bullet points where appropriate.

Operational Context:
${JSON.stringify(context || {}, null, 2)}

User Question:
${question}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      answer: response.text,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini API query error:', error);
    return res.status(500).json({
      error: 'Failed to generate response from Gemini API',
      details: error?.message || 'Unknown error',
    });
  }
});

// Operational Summary Endpoint
app.post('/api/gemini/summary', async (req, res) => {
  const { operationalData } = req.body;

  if (!aiClient) {
    return res.json({
      summary: null,
      source: 'fallback',
    });
  }

  try {
    const prompt = `You are SmartFlow's Chief Operations Analyst.
Generate an executive operational summary for the hospital administrator based on the following real-time operations data.
Structure your response into:
1. Current Hospital State & Bed Availability
2. Primary Operational Bottlenecks & Critical Risks (e.g. ED boarding risk, delayed discharges)
3. Financial & Insurance Coordination Status
4. Immediate Recommended Actions for Shift Leadership

Keep it concise, professional, and grounded in the numbers provided.

Operational Data:
${JSON.stringify(operationalData || {}, null, 2)}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      summary: response.text,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini API summary error:', error);
    return res.status(500).json({
      error: 'Failed to generate operational summary',
      details: error?.message || 'Unknown error',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
