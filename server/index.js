require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const createCrudRouter = require('./routes/crud');
const models = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// AI routes
app.use('/api/ai', require('./routes/ai'));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
    await sequelize.sync();
    console.log('✓ Models synced');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

start();
