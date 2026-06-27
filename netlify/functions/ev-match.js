/**
 * EV Horizon — AI EV Match serverless function
 * Netlify function that calls Claude to recommend EVs based on driving profile.
 *
 * Set ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables.
 */

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method not allowed' };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'API key not configured. Set ANTHROPIC_API_KEY in Netlify environment variables.' }),
    };
  }

  let profile;
  try {
    profile = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    unit = 'mi',
    monthly_dist = 900,
    fuel_use = 31,
    fuel_price = 3.60,
    ev_efficiency = 3.8,
    elec_price = 0.15,
    monthly_savings = '',
    yearly_savings = '',
    dealer = '',
    model = '',
  } = profile;

  const isKm = unit === 'km';
  const distLabel  = isKm ? `${monthly_dist} km/month` : `${monthly_dist} miles/month`;
  const fuelLabel  = isKm ? `${fuel_use} L/100km at $${fuel_price}/L` : `${fuel_use} MPG at $${fuel_price}/gallon`;
  const effLabel   = isKm ? `${ev_efficiency} kWh/100km` : `${ev_efficiency} mi/kWh`;
  const dealerLine = dealer ? `The customer is browsing ${dealer}'s inventory.` : '';
  const modelLine  = model  ? `They are considering the ${model} specifically.` : '';

  const prompt = `You are an expert EV advisor helping a customer who just ran a savings calculator on a dealership website.

Customer driving profile:
- Monthly driving: ${distLabel}
- Current fuel economy: ${fuelLabel}
- EV charging efficiency: ${effLabel}
- Electricity price: $${elec_price}/kWh
- Calculated monthly savings: ${monthly_savings || 'not provided'}
- Calculated yearly savings: ${yearly_savings || 'not provided'}
${dealerLine}
${modelLine}

Based on this profile, recommend exactly 3 EVs available for purchase in 2025-2026. Use real models with accurate specs.

Respond with valid JSON only — no markdown, no explanation outside the JSON, no trailing commas. Use this exact structure:

{
  "topPick": {
    "model": "Full model name with year",
    "tagline": "One sharp sentence explaining why this is the best fit",
    "reason": "2-3 sentences: range fit for their driving, specific payback calculation using their numbers, one standout feature",
    "payback": "X.X years",
    "range": "XXX miles"
  },
  "alternatives": [
    {
      "model": "Full model name with year",
      "tagline": "One sharp differentiator",
      "reason": "1-2 sentences on why to consider this one",
      "payback": "X.X years"
    },
    {
      "model": "Full model name with year",
      "tagline": "One sharp differentiator",
      "reason": "1-2 sentences on why to consider this one",
      "payback": "X.X years"
    }
  ],
  "summary": "One punchy sentence with a specific dollar figure summarising the opportunity"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'AI service error. Please try again.', upstream_status: response.status, upstream: err }),
      };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse and validate JSON from model response
    let result;
    try {
      // strip any accidental markdown fences
      const clean = text.replace(/^```(?:json)?\n?/,'').replace(/\n?```$/,'').trim();
      result = JSON.parse(clean);
    } catch {
      console.error('JSON parse failed. Raw text:', text);
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Could not parse AI response. Please try again.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unexpected error. Please try again.' }),
    };
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
