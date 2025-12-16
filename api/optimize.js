// api/optimize.js
// This runs on the server (Node.js environment).
// Your API Key is safe here.

export const config = {
  runtime: 'edge', // utilize Edge Functions for lower latency
};

// Simple in-memory rate limit map (IP -> timestamp)
// Note: For robust production rate limiting, use Redis (e.g., Upstash) 
// because this Map resets when the serverless function cold-boots.
const rateLimit = new Map();

export default async function handler(req) {
  // 1. CORS Setup (Allow your frontend to call this)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Rate Limiting (Basic)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute window
    const limit = 3; // 3 requests per minute per IP

    const userHistory = rateLimit.get(ip) || [];
    const validHistory = userHistory.filter(timestamp => now - timestamp < windowSize);
    
    if (validHistory.length >= limit) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait a moment.' 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update rate limit history
    validHistory.push(now);
    rateLimit.set(ip, validHistory);

    // 3. Parse Request
    const body = await req.json();
    const { systemInstruction, userPrompt, model } = body;

    if (!systemInstruction || !userPrompt) {
      throw new Error('Missing prompt data');
    }

    if (systemInstruction.length > 15000 || userPrompt.length > 15000) {
      return new Response(
        JSON.stringify({ error: "Prompt too long. Please shorten your input." }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Call OpenAI (Server-side call)
    // Note: Use process.env.OPENAI_API_KEY in Vercel settings, not VITE_
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('Server configuration error: Missing API Key');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return new Response(
        JSON.stringify({ error: data?.error?.message || "OpenAI request failed" }),
        { 
          status: openaiResponse.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // 5. Return Result to Frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  }
}
