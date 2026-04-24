import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ai } from '../services/api';

const aiConfig = {
  'obituary': {
    title: 'AI Obituary Writer',
    icon: '\u{1F4DD}',
    description: 'Generate professional, heartfelt obituaries using AI. Fill in the details below and let our AI craft a meaningful tribute.',
    endpoint: 'obituary',
    fields: [
      { name: 'deceased_name', label: 'Full Name of Deceased', type: 'text', required: true, placeholder: 'e.g., Robert Edward Johnson' },
      { name: 'birth_date', label: 'Date of Birth', type: 'text', placeholder: 'e.g., March 15, 1935' },
      { name: 'death_date', label: 'Date of Death', type: 'text', placeholder: 'e.g., January 10, 2024' },
      { name: 'biography', label: 'Life Story / Biography', type: 'textarea', placeholder: 'Share key life events, career, passions, community involvement...' },
      { name: 'family_members', label: 'Family Members', type: 'textarea', placeholder: 'Survived by wife Mary, children Thomas, Sarah, and Michael...' },
      { name: 'achievements', label: 'Notable Achievements', type: 'textarea', placeholder: 'Military service, awards, community contributions...' },
      { name: 'tone', label: 'Desired Tone', type: 'select', options: ['Warm and respectful', 'Formal and dignified', 'Celebratory', 'Religious/spiritual', 'Simple and heartfelt'] },
    ]
  },
  'inscription': {
    title: 'AI Inscription Suggestions',
    icon: '\u{1F4AC}',
    description: 'Get meaningful memorial inscription ideas for headstones and monuments. Our AI provides varied options from traditional to contemporary.',
    endpoint: 'inscription',
    fields: [
      { name: 'deceased_name', label: 'Name of Deceased', type: 'text', required: true, placeholder: 'e.g., Eleanor Williams' },
      { name: 'relationship', label: 'Primary Relationship', type: 'text', placeholder: 'e.g., Mother, Father, Spouse, Child' },
      { name: 'personality', label: 'Personality & Character', type: 'textarea', placeholder: 'Describe their personality, values, what made them special...' },
      { name: 'interests', label: 'Interests & Hobbies', type: 'textarea', placeholder: 'e.g., Gardening, music, teaching, volunteering...' },
      { name: 'style', label: 'Inscription Style', type: 'select', options: ['Mix of traditional and modern', 'Traditional/classic', 'Contemporary', 'Religious/spiritual', 'Poetic', 'Military'] },
    ]
  },
  'maintenance-prediction': {
    title: 'AI Maintenance Predictor',
    icon: '\u{1F327}',
    description: 'Get AI-powered grounds maintenance predictions based on weather, season, and current conditions.',
    endpoint: 'maintenancePrediction',
    fields: [
      { name: 'season', label: 'Current Season', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter'], required: true },
      { name: 'weather_forecast', label: 'Weather Forecast (Next 7 Days)', type: 'textarea', placeholder: 'e.g., Rain Monday-Tuesday, sunny Wednesday-Friday, high temps 75F...' },
      { name: 'location', label: 'Geographic Location', type: 'text', placeholder: 'e.g., Springfield, Illinois (Midwest US)' },
      { name: 'current_conditions', label: 'Current Ground Conditions', type: 'textarea', placeholder: 'e.g., Grass is growing fast, some standing water in Section B...' },
      { name: 'upcoming_events', label: 'Upcoming Events', type: 'textarea', placeholder: 'e.g., Memorial Day ceremony May 25, 3 burials scheduled this week...' },
    ]
  },
  'genealogy': {
    title: 'AI Genealogy Research Assistant',
    icon: '\u{1F50D}',
    description: 'Get AI-powered research strategies and guidance for tracing family history using cemetery records.',
    endpoint: 'genealogy',
    fields: [
      { name: 'person_name', label: 'Person to Research', type: 'text', required: true, placeholder: 'e.g., William Henry Thompson' },
      { name: 'birth_year', label: 'Approximate Birth Year', type: 'text', placeholder: 'e.g., 1930' },
      { name: 'death_year', label: 'Approximate Death Year', type: 'text', placeholder: 'e.g., 2024' },
      { name: 'known_relatives', label: 'Known Relatives', type: 'textarea', placeholder: 'e.g., Wife Susan Thompson, Father Henry Thompson...' },
      { name: 'location', label: 'Known Locations', type: 'text', placeholder: 'e.g., Springfield, IL area' },
      { name: 'additional_info', label: 'Additional Information', type: 'textarea', placeholder: 'Any other known facts: occupation, military service, church affiliation...' },
    ]
  },
  'memorial-page': {
    title: 'AI Memorial Page Creator',
    icon: '\u{1F310}',
    description: 'Generate beautiful virtual memorial page content that celebrates the life of your loved one.',
    endpoint: 'memorialPage',
    fields: [
      { name: 'deceased_name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., Dorothy Lee Chen' },
      { name: 'dates', label: 'Birth & Death Dates', type: 'text', placeholder: 'e.g., May 14, 1938 - April 2, 2024' },
      { name: 'biography', label: 'Life Story', type: 'textarea', placeholder: 'Share their life story, passions, accomplishments...' },
      { name: 'photos_description', label: 'Photos/Media to Include', type: 'textarea', placeholder: 'Describe photos you have: family portraits, career moments, hobbies...' },
      { name: 'family_message', label: 'Family\'s Personal Message', type: 'textarea', placeholder: 'A personal message from the family to visitors of the memorial page...' },
    ]
  },
  'bereavement': {
    title: 'AI Bereavement Resources',
    icon: '\u{1F49C}',
    description: 'Receive personalized grief support recommendations and bereavement resources tailored to your situation.',
    endpoint: 'bereavement',
    fields: [
      { name: 'relationship', label: 'Relationship to Deceased', type: 'select', options: ['Spouse/Partner', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Friend', 'Other'], required: true },
      { name: 'time_since_loss', label: 'Time Since Loss', type: 'select', options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', '6-12 months', 'Over 1 year'] },
      { name: 'age_group', label: 'Age Group of Bereaved', type: 'select', options: ['Child (under 12)', 'Teen (13-17)', 'Young Adult (18-25)', 'Adult (26-64)', 'Senior (65+)'] },
      { name: 'specific_needs', label: 'Specific Needs or Concerns', type: 'textarea', placeholder: 'e.g., Difficulty sleeping, helping children cope, returning to work...' },
    ]
  }
};

function formatAIResponse(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\d+\.\s(.*$)/gm, '<li>$1</li>')
    .replace(/^[-*]\s(.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  html = '<p>' + html + '</p>';
  html = html.replace(/<p><h([1-3])>/g, '<h$1>').replace(/<\/h([1-3])><\/p>/g, '</h$1>');
  html = html.replace(/<p><hr\/><\/p>/g, '<hr/>');
  html = html.replace(/<p><blockquote>/g, '<blockquote>').replace(/<\/blockquote><\/p>/g, '</blockquote>');
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    if (match.includes('<li>')) {
      return '<ul>' + match + '</ul>';
    }
    return match;
  });
  html = html.replace(/<\/ul><br\/><ul>/g, '');
  html = html.replace(/<\/ul><\/p><p><ul>/g, '');

  return html;
}

function AIFeaturePage({ user, onLogout }) {
  const { aiFeature } = useParams();
  const navigate = useNavigate();
  const config = aiConfig[aiFeature];

  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!config) return <div className="ai-page"><h2>AI Feature not found</h2></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await ai[config.endpoint](formData);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'AI request failed. Please check your OpenRouter API key in .env file.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <div className="header-logo">&#9773; Eternal Rest Memorial Park</div>
        </div>
        <div className="header-right">
          <span className="user-info">{user?.first_name} {user?.last_name}</span>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <div className="ai-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={() => navigate('/')}>&#8592;</button>
            <span className="page-icon">{config.icon}</span>
            <h1 className="page-title">{config.title}</h1>
            <span className="card-badge badge-ai" style={{ position: 'static' }}>AI Powered</span>
          </div>
        </div>

        <div className="ai-form">
          <h3>{config.description}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-row">
              {config.fields.map(field => (
                <div key={field.name} className="form-group" style={field.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                  <label>{field.label}{field.required ? ' *' : ''}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-generate" disabled={loading}>
              {loading ? 'Generating with AI...' : `Generate ${config.title.replace('AI ', '')}`}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ background: '#fed7d7', color: '#742a2a', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="spinner"></div>
            <p>AI is crafting your content...</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Using OpenRouter with Claude Haiku 4.5</p>
          </div>
        )}

        {result && (
          <div className="ai-result">
            <div className="ai-result-header">
              <span>{config.icon}</span>
              <h3>AI Generated Result</h3>
              <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.8 }}>Powered by Claude Haiku 4.5 via OpenRouter</span>
            </div>
            <div className="ai-result-body" dangerouslySetInnerHTML={{ __html: formatAIResponse(result) }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeaturePage;
