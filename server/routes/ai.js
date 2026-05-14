const express = require('express');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');
const router = express.Router();

router.use(authMiddleware);
router.use(aiRateLimiter);

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
const SYSTEM_PROMPT = 'You are a compassionate memorial park management AI assistant. Help with obituary writing, memorial planning, and cemetery operations with dignity and professionalism.';

// ─── AI Output persistence model (lazy-defined) ──────────────────────────────

let AiOutput;
function getAiOutputModel() {
  if (AiOutput) return AiOutput;
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
  }, {
    tableName: 'ai_outputs',
    timestamps: false
  });
  sequelize.sync(); // ensure table exists
  return AiOutput;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function callOpenRouter(messages, maxTokens = 1024) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = OPENROUTER_MODEL;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Cemetery Memorial Park Manager'
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
    console.warn('[AI] Failed to save output to DB:', err.message);
  }
}

function validateRequired(body, fields) {
  const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing;
}

// ─── GET /api/ai/history ──────────────────────────────────────────────────────

router.get('/history', async (req, res) => {
  try {
    const Model = getAiOutputModel();
    const { page = 1, limit = 20, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { user_id: req.user.id };
    if (type) where.type = type;

    const { count, rows } = await Model.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({
      history: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 1. Obituary Drafting ─────────────────────────────────────────────────────

router.post('/obituary', async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, biography, family_members, achievements, tone } = req.body;
    const missing = validateRequired(req.body, ['deceased_name']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' Write heartfelt, dignified obituaries that honor the deceased. Format with clear paragraphs. Be respectful and warm.' },
      {
        role: 'user',
        content: `Please write a professional obituary with the following details:
Name: ${deceased_name}
Born: ${birth_date || 'Not provided'}
Died: ${death_date || 'Not provided'}
Biography: ${biography || 'Not provided'}
Family Members: ${family_members || 'Not provided'}
Achievements: ${achievements || 'Not provided'}
Desired Tone: ${tone || 'Warm and respectful'}`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    await saveAiOutput(req.user.id, 'obituary', req.body, result);
    res.json({ result, type: 'obituary' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 2. Memorial Inscription Suggestions ─────────────────────────────────────

router.post('/inscription', async (req, res) => {
  try {
    const { deceased_name, relationship, personality, interests, style } = req.body;
    const missing = validateRequired(req.body, ['deceased_name']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' You are an expert at crafting meaningful memorial inscriptions for headstones and monuments. Provide multiple options ranging from traditional to contemporary. Each inscription should be concise yet meaningful.' },
      {
        role: 'user',
        content: `Please suggest 5 memorial inscriptions for:
Name: ${deceased_name}
Relationship: ${relationship || 'Not specified'}
Personality: ${personality || 'Not specified'}
Interests/Hobbies: ${interests || 'Not specified'}
Preferred Style: ${style || 'Mix of traditional and modern'}

Please provide varied options from short phrases to longer verses.`
      }
    ];
    const result = await callOpenRouter(messages, 1200);
    await saveAiOutput(req.user.id, 'inscription', req.body, result);
    res.json({ result, type: 'inscription' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 3. Grounds Maintenance Prediction ───────────────────────────────────────

router.post('/maintenance-prediction', async (req, res) => {
  try {
    const { season, weather_forecast, location, current_conditions, upcoming_events } = req.body;
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' You are a grounds maintenance expert for cemetery and memorial parks. Provide detailed, actionable maintenance predictions.' },
      {
        role: 'user',
        content: `Please provide grounds maintenance predictions and recommendations:
Current Season: ${season || 'Not specified'}
Weather Forecast: ${weather_forecast || 'Not specified'}
Location/Region: ${location || 'Midwest US'}
Current Ground Conditions: ${current_conditions || 'Not specified'}
Upcoming Events: ${upcoming_events || 'None specified'}

Please include:
1. Immediate maintenance tasks (next 7 days)
2. Weekly maintenance schedule
3. Weather-specific preparations
4. Seasonal care recommendations
5. Equipment and resource needs`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    await saveAiOutput(req.user.id, 'maintenance_prediction', req.body, result);
    res.json({ result, type: 'maintenance_prediction' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 4. Genealogy Research Assistance ────────────────────────────────────────

router.post('/genealogy', async (req, res) => {
  try {
    const { person_name, birth_year, death_year, known_relatives, location, additional_info } = req.body;
    const missing = validateRequired(req.body, ['person_name']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' You are a genealogy research expert specializing in cemetery records and family history.' },
      {
        role: 'user',
        content: `Please provide genealogy research guidance for:
Person: ${person_name}
Birth Year: ${birth_year || 'Unknown'}
Death Year: ${death_year || 'Unknown'}
Known Relatives: ${known_relatives || 'None known'}
Location: ${location || 'Not specified'}
Additional Info: ${additional_info || 'None'}`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    await saveAiOutput(req.user.id, 'genealogy', req.body, result);
    res.json({ result, type: 'genealogy' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 5. Virtual Memorial Page Content ────────────────────────────────────────

router.post('/memorial-page', async (req, res) => {
  try {
    const { deceased_name, dates, biography, photos_description, family_message } = req.body;
    const missing = validateRequired(req.body, ['deceased_name']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' You are a digital memorial content creator. Create beautiful, moving virtual memorial page content.' },
      {
        role: 'user',
        content: `Please create virtual memorial page content for:
Name: ${deceased_name}
Dates: ${dates || 'Not provided'}
Biography: ${biography || 'Not provided'}
Photos/Media Description: ${photos_description || 'Standard memorial photos'}
Family Message: ${family_message || 'Not provided'}

Please create:
1. A touching headline and introduction
2. Life story section
3. Memories and tributes section template
4. Photo gallery descriptions
5. Closing message of remembrance`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    await saveAiOutput(req.user.id, 'memorial_page', req.body, result);
    res.json({ result, type: 'memorial_page' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 6. Bereavement Resource Recommendations ──────────────────────────────────

router.post('/bereavement', async (req, res) => {
  try {
    const { relationship, time_since_loss, age_group, specific_needs } = req.body;
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + ' You are a compassionate bereavement counselor providing resource recommendations.' },
      {
        role: 'user',
        content: `Please recommend bereavement resources for someone who:
Relationship to deceased: ${relationship || 'Not specified'}
Time since loss: ${time_since_loss || 'Recent'}
Age group: ${age_group || 'Adult'}
Specific needs: ${specific_needs || 'General grief support'}`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    await saveAiOutput(req.user.id, 'bereavement', req.body, result);
    res.json({ result, type: 'bereavement' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
