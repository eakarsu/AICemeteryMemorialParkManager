import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ai } from '../services/api';

const TYPES = [
  '', 'virtual_tour', 'monument_designer', 'burial_site_recommender', 'legacy_document_advisor',
  'family_reunion', 'perpetual_care_allocation', 'historical_archive', 'commemorative_event'
];

function AIHistory({ user, onLogout }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ai.results({ page, limit: 20, ...(type ? { type } : {}) });
      setData(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, total_pages: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [page, type]);

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
            <span className="page-icon">&#128450;</span>
            <h1 className="page-title">AI Run History</h1>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>Filter by type:</label>
          <select value={type} onChange={(e) => { setPage(1); setType(e.target.value); }}>
            {TYPES.map(t => <option key={t} value={t}>{t || 'All'}</option>)}
          </select>
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            {data.length === 0 && <p>No AI runs yet.</p>}
            {data.map(row => (
              <div key={row.id} style={{ padding: 12, background: '#fff', borderRadius: 12, margin: '8px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{row.type}</strong>
                  <span style={{ color: '#718096' }}>{new Date(row.created_at).toLocaleString()}</span>
                </div>
                <button className="btn" onClick={() => setExpanded(expanded === row.id ? null : row.id)} style={{ marginTop: 8 }}>
                  {expanded === row.id ? 'Hide' : 'Show'} Details
                </button>
                {expanded === row.id && (
                  <>
                    <h4>Input</h4>
                    <pre style={{ background: '#f7fafc', padding: 8, borderRadius: 8, overflow: 'auto' }}>
                      {row.input_data}
                    </pre>
                    <h4>Output</h4>
                    <pre style={{ background: '#f7fafc', padding: 8, borderRadius: 8, overflow: 'auto', maxHeight: 400 }}>
                      {row.output_text}
                    </pre>
                  </>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span>Page {page} of {pagination.total_pages || 1} ({pagination.total} total)</span>
              <button className="btn" disabled={page >= (pagination.total_pages || 1)} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIHistory;
