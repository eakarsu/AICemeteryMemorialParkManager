const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

async function callOpenRouter(messages, maxTokens = 1024) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Cemetery Memorial Park Manager'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 1. Obituary Drafting
router.post('/obituary', async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, biography, family_members, achievements, tone } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a compassionate obituary writer for a cemetery and memorial park. Write heartfelt, dignified obituaries that honor the deceased. Format with clear paragraphs. Be respectful and warm.'
      },
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
    res.json({ result, type: 'obituary' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Memorial Inscription Suggestions
router.post('/inscription', async (req, res) => {
  try {
    const { deceased_name, relationship, personality, interests, style } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are an expert at crafting meaningful memorial inscriptions for headstones and monuments. Provide multiple options ranging from traditional to contemporary. Each inscription should be concise yet meaningful.'
      },
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
    res.json({ result, type: 'inscription' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Grounds Maintenance Prediction
router.post('/maintenance-prediction', async (req, res) => {
  try {
    const { season, weather_forecast, location, current_conditions, upcoming_events } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a grounds maintenance expert for cemetery and memorial parks. Provide detailed, actionable maintenance predictions and recommendations based on weather and seasonal conditions. Include specific tasks, timelines, and priorities.'
      },
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
    res.json({ result, type: 'maintenance_prediction' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Genealogy Research Assistance
router.post('/genealogy', async (req, res) => {
  try {
    const { person_name, birth_year, death_year, known_relatives, location, additional_info } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a genealogy research expert specializing in cemetery records and family history. Provide research strategies, potential record sources, and help interpret historical records. Be thorough and methodical in your suggestions.'
      },
      {
        role: 'user',
        content: `Please provide genealogy research guidance for:
Person: ${person_name}
Birth Year: ${birth_year || 'Unknown'}
Death Year: ${death_year || 'Unknown'}
Known Relatives: ${known_relatives || 'None known'}
Location: ${location || 'Not specified'}
Additional Info: ${additional_info || 'None'}

Please suggest:
1. Research strategy and approach
2. Recommended record sources to search
3. Possible family connections to investigate
4. Historical context for the time period
5. Tips for verifying information found`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    res.json({ result, type: 'genealogy' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Virtual Memorial Page Content
router.post('/memorial-page', async (req, res) => {
  try {
    const { deceased_name, dates, biography, photos_description, family_message } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a digital memorial content creator. Create beautiful, moving virtual memorial page content that celebrates the life of the deceased. Include sections for biography, tributes, and remembrances. Format with clear headings and sections.'
      },
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
    res.json({ result, type: 'memorial_page' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Bereavement Resource Recommendations
router.post('/bereavement', async (req, res) => {
  try {
    const { relationship, time_since_loss, age_group, specific_needs } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a compassionate bereavement counselor providing resource recommendations. Offer sensitive, helpful guidance and resources for those grieving. Be empathetic and professional.'
      },
      {
        role: 'user',
        content: `Please recommend bereavement resources for someone who:
Relationship to deceased: ${relationship || 'Not specified'}
Time since loss: ${time_since_loss || 'Recent'}
Age group: ${age_group || 'Adult'}
Specific needs: ${specific_needs || 'General grief support'}

Please provide:
1. Immediate support resources
2. Grief counseling recommendations
3. Support groups
4. Books and reading resources
5. Online resources and communities
6. Self-care recommendations
7. When to seek professional help`
      }
    ];
    const result = await callOpenRouter(messages, 1500);
    res.json({ result, type: 'bereavement' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
