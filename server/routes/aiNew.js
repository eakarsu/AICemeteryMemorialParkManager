/**
 * New AI endpoints for Cemetery Memorial Park Manager.
 *
 * POST /api/ai/virtual-tour         - Guided tour script for cemetery plots
 * POST /api/ai/monument-designer    - Monument specifications and suggestions
 * POST /api/ai/burial-site-recommender - Ranked plot recommendations
 * POST /api/ai/legacy-document-advisor - Extract life events from documents
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

router.use(authMiddleware);
router.use(aiRateLimiter);

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
const SYSTEM_PROMPT = 'You are a compassionate memorial park management AI assistant. Help with obituary writing, memorial planning, and cemetery operations with dignity and professionalism.';

// 3-strategy JSON parser
function parseAIJson(raw) {
  if (!raw || typeof raw !== 'string') return { raw };
  try { return JSON.parse(raw); } catch (_) {}
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (_) {}
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(raw.slice(start, end + 1));
  } catch (_) {}
  return { raw };
}

// ─── AI Output persistence model (lazy, reuses existing if defined) ─────────

let AiOutput;
function getAiOutputModel() {
  if (AiOutput) return AiOutput;
  // Reuse if another router already defined it (Sequelize throws on redefinition)
  if (sequelize.models && sequelize.models.AiOutput) {
    AiOutput = sequelize.models.AiOutput;
    return AiOutput;
  }
  AiOutput = sequelize.define('AiOutput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false },
    input_data: { type: DataTypes.TEXT },
    output_text: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'ai_outputs', timestamps: false });
  sequelize.sync();
  return AiOutput;
}

async function saveAiOutput(userId, type, inputData, outputText) {
  try {
    const Model = getAiOutputModel();
    await Model.create({
      user_id: userId,
      type,
      input_data: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
      output_text: outputText,
      created_at: new Date()
    });
  } catch (err) {
    console.warn('[AINew] Failed to save output:', err.message);
  }
}

// ─── OpenRouter helper ────────────────────────────────────────────────────────

async function callOpenRouter(messages, maxTokens = 1500) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Cemetery Memorial Park Manager'
    },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages, max_tokens: maxTokens, temperature: 0.7 })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function validateRequired(body, fields) {
  return fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
}

// ─── 1. Virtual Tour Script Generator ────────────────────────────────────────

router.post('/virtual-tour', async (req, res) => {
  try {
    const { plot_locations, cemetery_history } = req.body;
    const missing = validateRequired(req.body, ['plot_locations', 'cemetery_history']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    if (!Array.isArray(plot_locations)) return res.status(400).json({ error: 'plot_locations must be an array' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You create engaging, respectful guided tour scripts for cemetery virtual tours. Include historical context, notable figures, architectural details, and directions between stops.'
      },
      {
        role: 'user',
        content: `Please create a guided virtual tour script for the following cemetery.

Cemetery History: ${JSON.stringify(cemetery_history)}
Plot Locations to Feature: ${JSON.stringify(plot_locations)}

Please write a comprehensive tour script that includes:
1. Welcome introduction and cemetery overview
2. Directions and transitions between each featured plot (with GPS coordinates if provided)
3. Historical context and notable stories for each stop
4. Architectural or horticultural highlights along the route
5. Respectful narrative voice appropriate for a memorial setting
6. Closing message thanking visitors for their respect

Format as a structured script with clear section headers and estimated time per section.`
      }
    ];

    const result = await callOpenRouter(messages, 2000);
    await saveAiOutput(req.user.id, 'virtual_tour', req.body, result);
    res.json({ result, type: 'virtual_tour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 2. Monument Designer ─────────────────────────────────────────────────────

router.post('/monument-designer', async (req, res) => {
  try {
    const { design_preferences, budget, materials_available } = req.body;
    const missing = validateRequired(req.body, ['design_preferences', 'budget']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You are a monument design specialist with expertise in memorial architecture, stone carving, and memorial aesthetics. Provide practical, sensitive design guidance.'
      },
      {
        role: 'user',
        content: `Please provide monument design recommendations with the following parameters:

Design Preferences: ${JSON.stringify(design_preferences)}
Budget: $${budget}
Available Materials: ${JSON.stringify(materials_available || 'Standard options (granite, marble, limestone, bronze)')}

Please provide:
1. Recommended monument style and dimensions
2. Material selection with pros/cons within budget
3. Engraving suggestions (layout, font recommendations, symbols)
4. Base/foundation specifications
5. Weathering and maintenance considerations
6. Estimated costs and timeline
7. Vendor/supplier suggestions or criteria
8. Alternative options at different price points
9. Regulatory considerations (common cemetery rules)
10. Care instructions for longevity`
      }
    ];

    const result = await callOpenRouter(messages, 1800);
    await saveAiOutput(req.user.id, 'monument_designer', req.body, result);
    res.json({ result, type: 'monument_designer' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 3. Burial Site Recommender ───────────────────────────────────────────────

router.post('/burial-site-recommender', async (req, res) => {
  try {
    const { family_requirements, available_plots } = req.body;
    const missing = validateRequired(req.body, ['family_requirements', 'available_plots']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    if (!Array.isArray(available_plots)) return res.status(400).json({ error: 'available_plots must be an array' });
    if (!available_plots.length) return res.status(400).json({ error: 'available_plots cannot be empty' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You are a compassionate cemetery counselor who helps families find the most suitable burial plots. Be sensitive, thorough, and clear in your recommendations.'
      },
      {
        role: 'user',
        content: `Please analyze and rank the available burial plots for this family.

Family Requirements and Preferences: ${JSON.stringify(family_requirements)}
Available Plots: ${JSON.stringify(available_plots)}

Please provide:
1. Ranked list of plot recommendations (most to least suitable)
2. For each recommendation: plot ID/reference, match score (1-10), explanation of why it fits
3. Key factors considered in your ranking
4. Any plots that are specifically NOT recommended and why
5. Questions the family should ask before deciding
6. Next steps in the selection process
7. Pricing summary if available
8. Special considerations (veteran benefits, family groupings, accessibility needs, religious considerations)`
      }
    ];

    const result = await callOpenRouter(messages, 1800);
    await saveAiOutput(req.user.id, 'burial_site_recommender', req.body, result);
    res.json({ result, type: 'burial_site_recommender' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 4. Legacy Document Advisor ───────────────────────────────────────────────

router.post('/legacy-document-advisor', async (req, res) => {
  try {
    const { documents_text } = req.body;
    const missing = validateRequired(req.body, ['documents_text']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You are a skilled biographer and memorial content specialist. Extract meaningful life events from documents and help craft compelling memorial narratives. Be thorough, respectful, and sensitive.'
      },
      {
        role: 'user',
        content: `Please analyze the following documents and extract information to help with memorial content creation.

Documents Text:
${documents_text}

Please provide:
1. Extracted Key Life Events (chronological timeline)
2. Significant Achievements and Milestones (career, education, community)
3. Character Traits and Personality Indicators
4. Family Connections and Relationships Mentioned
5. Notable Quotes or Phrases Worth Preserving
6. Suggested Obituary Angles (3-5 narrative themes)
7. Flagged Notable Achievements (military service, community impact, unique accomplishments)
8. Potential Photo/Media Opportunities (events worth illustrating)
9. Gaps or areas where more information might be helpful
10. Sensitive Information to Handle Carefully`
      }
    ];

    const result = await callOpenRouter(messages, 2000);
    await saveAiOutput(req.user.id, 'legacy_document_advisor', req.body, result);
    res.json({ result, type: 'legacy_document_advisor' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 5. Family Reunion Organizer ─────────────────────────────────────────────

router.post('/family-reunion', async (req, res) => {
  try {
    const { surname, family_records, suggested_dates, attendee_count } = req.body;
    if (!surname) return res.status(400).json({ error: 'surname is required' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You organize family reunions at memorial parks. Provide JSON output for itinerary, RSVP tracking suggestions, and invitation copy.',
      },
      {
        role: 'user',
        content: `Plan a family reunion at the cemetery.

Surname: ${surname}
Known Family Records: ${JSON.stringify(family_records || [])}
Suggested Dates: ${JSON.stringify(suggested_dates || [])}
Expected Attendees: ${attendee_count || 'unknown'}

Return JSON:
{
  "family_clusters": [{ "branch": string, "estimated_descendants": number, "key_members": [string] }],
  "recommended_date": { "date": "YYYY-MM-DD", "reasoning": string, "alternates": ["YYYY-MM-DD"] },
  "schedule": [{ "time": "HH:MM", "activity": string, "location_in_cemetery": string, "duration_minutes": number }],
  "invitation_text": string,
  "rsvp_form_fields": [string],
  "logistics_checklist": [string],
  "memorial_activities": [{ "name": string, "description": string, "duration_minutes": number }],
  "estimated_budget": { "low": number, "mid": number, "high": number, "breakdown": [{ "item": string, "cost": number }] },
  "vendors_to_contact": [{ "type": string, "purpose": string }]
}`,
      },
    ];

    const raw = await callOpenRouter(messages, 2000);
    const result = parseAIJson(raw);
    await saveAiOutput(req.user.id, 'family_reunion', req.body, JSON.stringify(result));
    res.json({ result, type: 'family_reunion' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 6. Perpetual Care Fund Allocation ───────────────────────────────────────

router.post('/perpetual-care-allocation', async (req, res) => {
  try {
    const { endowment_balance, annual_yield_pct, current_obligations, inflation_pct, projection_years } = req.body;
    if (!endowment_balance) return res.status(400).json({ error: 'endowment_balance is required' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You optimize perpetual care fund allocation for cemeteries. Output structured JSON budget guidance.',
      },
      {
        role: 'user',
        content: `Optimize maintenance budget allocation for a perpetual care fund.

Endowment Balance: $${endowment_balance}
Annual Yield (%): ${annual_yield_pct || 4.5}
Inflation (%): ${inflation_pct || 3.0}
Projection Years: ${projection_years || 25}
Current Obligations: ${JSON.stringify(current_obligations || [])}

Return JSON:
{
  "summary": { "annual_spendable": number, "long_term_sustainability": "excellent|good|caution|concerning", "notes": string },
  "annual_budget_allocation": [
    { "category": "landscaping|maintenance|admin|reserves|capital_improvements|technology|other", "amount": number, "pct": number, "rationale": string }
  ],
  "seasonal_priorities": [{ "season": "spring|summer|fall|winter", "focus": string, "estimated_cost": number }],
  "capital_improvements_5_year": [{ "project": string, "year": number, "cost": number, "expected_lifespan_years": number }],
  "inflation_projections": [{ "year": number, "real_spendable": number, "expected_costs": number, "shortfall_or_surplus": number }],
  "scenario_modeling": { "best_case": string, "expected_case": string, "worst_case": string },
  "recommended_policy_changes": [string],
  "warnings": [string]
}`,
      },
    ];

    const raw = await callOpenRouter(messages, 2000);
    const result = parseAIJson(raw);
    await saveAiOutput(req.user.id, 'perpetual_care_allocation', req.body, JSON.stringify(result));
    res.json({ result, type: 'perpetual_care_allocation' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 7. Historical Archive Assistant ─────────────────────────────────────────

router.post('/historical-archive', async (req, res) => {
  try {
    const { document_text, existing_records } = req.body;
    if (!document_text) return res.status(400).json({ error: 'document_text is required' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You are a cemetery archive specialist. Extract names, dates, and links existing records from digitized historical documents. Return structured JSON.',
      },
      {
        role: 'user',
        content: `Process the following historical archive text. Extract entities and link to existing records.

Document Text:
${document_text}

Existing Records (sample):
${JSON.stringify(existing_records || []).slice(0, 3000)}

Return JSON:
{
  "extracted_entities": {
    "people": [{ "name": string, "birth": "YYYY-MM-DD|null", "death": "YYYY-MM-DD|null", "role": string, "context": string }],
    "places": [string],
    "events": [{ "name": string, "date": string, "description": string }],
    "organizations": [string]
  },
  "linked_records": [{ "extracted_name": string, "matched_record_id": number|null, "confidence": "high|medium|low", "reasoning": string }],
  "duplicates_detected": [{ "record_ids": [number], "reason": string }],
  "data_gaps": [{ "person_or_event": string, "missing_field": string, "suggested_source": string }],
  "recommended_corrections": [{ "record_id": number|null, "field": string, "current_value": string, "suggested_value": string, "evidence": string }],
  "transcription_quality_score": number,
  "next_research_steps": [string]
}`,
      },
    ];

    const raw = await callOpenRouter(messages, 2200);
    const result = parseAIJson(raw);
    await saveAiOutput(req.user.id, 'historical_archive', req.body, JSON.stringify(result));
    res.json({ result, type: 'historical_archive' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 8. Commemorative Event Planner ──────────────────────────────────────────

router.post('/commemorative-event', async (req, res) => {
  try {
    const { upcoming_anniversaries, event_themes, target_audience, budget } = req.body;
    if (!upcoming_anniversaries) return res.status(400).json({ error: 'upcoming_anniversaries is required' });

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + ' You plan commemorative events for cemeteries (Memorial Day, heritage celebrations, candle-lit vigils). Return structured JSON with marketing copy and vendor needs.',
      },
      {
        role: 'user',
        content: `Plan commemorative events.

Upcoming Anniversaries: ${JSON.stringify(upcoming_anniversaries)}
Suggested Themes: ${JSON.stringify(event_themes || [])}
Target Audience: ${target_audience || 'general public + families'}
Budget: $${budget || 'flexible'}

Return JSON:
{
  "events": [
    {
      "name": string,
      "anniversary": string,
      "date": "YYYY-MM-DD",
      "theme": string,
      "tagline": string,
      "duration_hours": number,
      "audience": string,
      "estimated_attendance": number,
      "schedule": [{ "time": "HH:MM", "activity": string }],
      "marketing_copy": { "press_release": string, "social_post": string, "email_subject": string, "email_body": string },
      "vendors_needed": [{ "type": string, "purpose": string, "estimated_cost": number }],
      "decorations_and_supplies": [{ "item": string, "quantity": number, "estimated_cost": number }],
      "permits_or_compliance": [string],
      "estimated_total_cost": number,
      "expected_revenue_or_goodwill": string
    }
  ],
  "annual_calendar": [{ "month": string, "event_name": string, "promotional_window_start": "YYYY-MM-DD" }],
  "follow_up_actions": [string]
}`,
      },
    ];

    const raw = await callOpenRouter(messages, 2200);
    const result = parseAIJson(raw);
    await saveAiOutput(req.user.id, 'commemorative_event', req.body, JSON.stringify(result));
    res.json({ result, type: 'commemorative_event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── AI Run History (paginated) ──────────────────────────────────────────────

router.get('/results', async (req, res) => {
  try {
    const Model = getAiOutputModel();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.type) where.type = req.query.type;

    const { count, rows } = await Model.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit, offset,
    });
    res.json({
      data: rows,
      pagination: { total: count, page, limit, total_pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Feedback ─────────────────────────────────────────────────────────────────

let AiFeedback;
function getAiFeedbackModel() {
  if (AiFeedback) return AiFeedback;
  AiFeedback = sequelize.define('AiFeedback', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    endpoint: { type: DataTypes.STRING },
    rating: { type: DataTypes.INTEGER },
    flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
    flag_reason: { type: DataTypes.TEXT },
    comment: { type: DataTypes.TEXT },
    request_data: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'ai_feedback', timestamps: false });
  sequelize.sync();
  return AiFeedback;
}

router.post('/feedback', async (req, res) => {
  try {
    const { rating, endpoint, flagged, flag_reason, comment, request_data } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });
    const Model = getAiFeedbackModel();
    const row = await Model.create({
      user_id: req.user.id,
      endpoint: endpoint || null,
      rating,
      flagged: !!flagged,
      flag_reason: flag_reason || null,
      comment: comment || null,
      request_data: request_data ? JSON.stringify(request_data) : null,
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
