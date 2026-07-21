require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('./config/runtime').validateRuntime();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const createCrudRouter = require('./routes/crud');
const models = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Env-driven CORS allow-list (comma-separated).
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// AI routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ai', require('./routes/aiNew'));

// Obituary draft/approval workflow
app.use('/api/obituaries', require('./routes/obituaries'));

// Notifications
app.use('/api/notifications', require('./routes/notifications'));

// Data transfer (import/export)
app.use('/api/export', require('./routes/dataTransfer'));
app.use('/api/import', require('./routes/dataTransfer'));

// CRUD routes for all models
app.use('/api/plots', createCrudRouter(models.Plot));
app.use('/api/burial-records', createCrudRouter(models.BurialRecord));
app.use('/api/deeds', createCrudRouter(models.Deed));
app.use('/api/interment-schedules', createCrudRouter(models.IntermentSchedule));
app.use('/api/pre-need-contracts', createCrudRouter(models.PreNeedContract));
app.use('/api/monument-orders', createCrudRouter(models.MonumentOrder));
app.use('/api/perpetual-care-funds', createCrudRouter(models.PerpetualCareFund));
app.use('/api/grounds-maintenance', createCrudRouter(models.GroundsMaintenance));
app.use('/api/flower-placements', createCrudRouter(models.FlowerPlacement));
app.use('/api/ceremony-schedules', createCrudRouter(models.CeremonySchedule));
app.use('/api/vendors', createCrudRouter(models.Vendor));
app.use('/api/compliance-records', createCrudRouter(models.ComplianceRecord));
app.use('/api/memorial-events', createCrudRouter(models.MemorialEvent));
app.use('/api/genealogy-records', createCrudRouter(models.GenealogyRecord));
app.use('/api/payment-plans', createCrudRouter(models.PaymentPlan));
app.use('/api/cremation-niches', createCrudRouter(models.CremationNiche));
app.use('/api/veteran-records', createCrudRouter(models.VeteranRecord));
app.use('/api/deed-transfers', createCrudRouter(models.DeedTransfer));
app.use('/api/governed-cases', require('./routes/governedCases'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
    // Schema changes are applied explicitly with scripts/migrate.sh.
    
app.use('/api/memorial-concierge', require('./routes/memorialConcierge')); // apply pass 6 — audit custom suggestion

app.use('/api/genealogy-rag', require('./routes/genealogyRag')); // apply pass 6 — audit custom suggestion

app.use('/api/maintenance-alerts', require('./routes/maintenanceAlerts')); // apply pass 6 — audit custom suggestion

app.use('/api/operator-white-label', require('./routes/operatorWhiteLabel')); // apply pass 6 — audit custom suggestion
app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

start();
