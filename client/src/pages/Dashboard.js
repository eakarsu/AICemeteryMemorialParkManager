import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { key: 'plots', icon: '\u{1F5FA}', title: 'Plot Inventory & Map', desc: 'Manage sections, rows, and plot availability with interactive mapping' },
  { key: 'burial-records', icon: '\u{1F4DC}', title: 'Burial Records', desc: 'Complete database of all burial records and deceased information' },
  { key: 'deeds', icon: '\u{1F4C4}', title: 'Deed & Ownership', desc: 'Track plot ownership, deed documentation, and transfers' },
  { key: 'interment-schedules', icon: '\u{1F4C5}', title: 'Interment Scheduling', desc: 'Schedule and manage burial, cremation, and entombment services' },
  { key: 'pre-need-contracts', icon: '\u{1F4DD}', title: 'Pre-Need Contracts', desc: 'Advance purchase contracts and payment tracking' },
  { key: 'monument-orders', icon: '\u{1F3DB}', title: 'Monument & Marker Orders', desc: 'Order tracking for headstones, markers, and monuments' },
  { key: 'perpetual-care-funds', icon: '\u{1F4B0}', title: 'Perpetual Care Fund', desc: 'Endowment fund tracking, contributions, and disbursements' },
  { key: 'grounds-maintenance', icon: '\u{1F33F}', title: 'Grounds Maintenance', desc: 'Scheduling and tracking of all grounds keeping activities' },
  { key: 'flower-placements', icon: '\u{1F490}', title: 'Flower Placements', desc: 'Track flower deliveries, placements, and removal schedules' },
  { key: 'ceremony-schedules', icon: '\u26EA', title: 'Chapel & Ceremony', desc: 'Schedule funerals, memorials, and other ceremonies' },
  { key: 'vendors', icon: '\u{1F91D}', title: 'Vendor Management', desc: 'Manage funeral homes, florists, vault companies, and more' },
  { key: 'compliance-records', icon: '\u2696', title: 'Compliance & Regulations', desc: 'Track state, federal, and environmental compliance' },
  { key: 'memorial-events', icon: '\u{1F56F}', title: 'Memorial Events', desc: 'Plan and manage memorial events, holidays, and community gatherings' },
  { key: 'genealogy-records', icon: '\u{1F333}', title: 'Genealogy Records', desc: 'Family history research and lineage documentation' },
  { key: 'payment-plans', icon: '\u{1F4B3}', title: 'Payment Plans', desc: 'Track installment payments, balances, and financial plans' },
  { key: 'cremation-niches', icon: '\u{1F3FA}', title: 'Cremation & Columbarium', desc: 'Manage cremation niches, urns, and columbarium records' },
  { key: 'veteran-records', icon: '\u{1F1FA}\u{1F1F8}', title: 'Veteran Section', desc: 'Military service records, VA benefits, and veteran memorials' },
  { key: 'deed-transfers', icon: '\u{1F501}', title: 'Deed Transfers', desc: 'Process ownership transfers, inheritance, and deed changes' },
];

const aiFeatures = [
  { key: 'obituary', icon: '\u{1F4DD}', title: 'AI Obituary Writer', desc: 'Generate professional, heartfelt obituaries with AI assistance' },
  { key: 'inscription', icon: '\u{1F4AC}', title: 'AI Inscription Suggestions', desc: 'Get meaningful memorial inscription ideas for monuments' },
  { key: 'maintenance-prediction', icon: '\u{1F327}', title: 'AI Maintenance Predictor', desc: 'Weather-based grounds maintenance predictions and scheduling' },
  { key: 'genealogy', icon: '\u{1F50D}', title: 'AI Genealogy Assistant', desc: 'AI-powered family history research and record analysis' },
  { key: 'memorial-page', icon: '\u{1F310}', title: 'AI Memorial Page Creator', desc: 'Generate beautiful virtual memorial page content' },
  { key: 'bereavement', icon: '\u{1F49C}', title: 'AI Bereavement Resources', desc: 'Personalized grief support and resource recommendations' },
];

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

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

      <div className="dashboard">
        <h1 className="dashboard-title">Cemetery Management Dashboard</h1>
        <p className="dashboard-subtitle">Comprehensive management system for memorial park operations</p>

        <div className="section-title">
          <span>&#9883;</span> AI-Powered Features
        </div>
        <div className="cards-grid">
          {aiFeatures.map(f => (
            <div key={f.key} className="feature-card" onClick={() => navigate(`/ai/${f.key}`)}>
              <span className="card-badge badge-ai">AI</span>
              <div className="card-icon">{f.icon}</div>
              <div className="card-title">{f.title}</div>
              <div className="card-description">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="section-title">
          <span>&#128218;</span> Operations & Records Management
        </div>
        <div className="cards-grid">
          {features.map(f => (
            <div key={f.key} className="feature-card" onClick={() => navigate(`/feature/${f.key}`)}>
              <div className="card-icon">{f.icon}</div>
              <div className="card-title">{f.title}</div>
              <div className="card-description">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
