const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 1. Plot Inventory
const Plot = sequelize.define('Plot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  section: { type: DataTypes.STRING, allowNull: false },
  row: { type: DataTypes.STRING, allowNull: false },
  plot_number: { type: DataTypes.STRING, allowNull: false },
  plot_type: { type: DataTypes.ENUM('single', 'double', 'family', 'cremation', 'mausoleum', 'columbarium'), defaultValue: 'single' },
  status: { type: DataTypes.ENUM('available', 'sold', 'occupied', 'reserved'), defaultValue: 'available' },
  price: { type: DataTypes.DECIMAL(10, 2) },
  size_sqft: { type: DataTypes.DECIMAL(8, 2) },
  gps_lat: { type: DataTypes.DECIMAL(10, 7) },
  gps_lng: { type: DataTypes.DECIMAL(10, 7) },
  notes: { type: DataTypes.TEXT }
});

// 2. Burial Records
const BurialRecord = sequelize.define('BurialRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deceased_first_name: { type: DataTypes.STRING, allowNull: false },
  deceased_last_name: { type: DataTypes.STRING, allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY },
  date_of_death: { type: DataTypes.DATEONLY },
  date_of_burial: { type: DataTypes.DATEONLY },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  cause_of_death: { type: DataTypes.STRING },
  funeral_home: { type: DataTypes.STRING },
  obituary: { type: DataTypes.TEXT },
  veteran: { type: DataTypes.BOOLEAN, defaultValue: false },
  veteran_branch: { type: DataTypes.STRING },
  next_of_kin: { type: DataTypes.STRING },
  next_of_kin_phone: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

// 3. Deed/Ownership
const Deed = sequelize.define('Deed', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deed_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  owner_first_name: { type: DataTypes.STRING, allowNull: false },
  owner_last_name: { type: DataTypes.STRING, allowNull: false },
  owner_email: { type: DataTypes.STRING },
  owner_phone: { type: DataTypes.STRING },
  owner_address: { type: DataTypes.TEXT },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  purchase_date: { type: DataTypes.DATEONLY },
  purchase_price: { type: DataTypes.DECIMAL(10, 2) },
  deed_type: { type: DataTypes.ENUM('perpetual', 'term', 'pre-need', 'at-need'), defaultValue: 'perpetual' },
  status: { type: DataTypes.ENUM('active', 'transferred', 'expired', 'cancelled'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// 4. Interment Scheduling
const IntermentSchedule = sequelize.define('IntermentSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deceased_name: { type: DataTypes.STRING, allowNull: false },
  scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
  scheduled_time: { type: DataTypes.TIME },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  interment_type: { type: DataTypes.ENUM('burial', 'cremation', 'entombment', 'inurnment'), defaultValue: 'burial' },
  funeral_home: { type: DataTypes.STRING },
  funeral_director: { type: DataTypes.STRING },
  officiant: { type: DataTypes.STRING },
  expected_attendees: { type: DataTypes.INTEGER },
  special_requests: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'postponed'), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT }
});

// 5. Pre-Need Contracts
const PreNeedContract = sequelize.define('PreNeedContract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contract_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  client_first_name: { type: DataTypes.STRING, allowNull: false },
  client_last_name: { type: DataTypes.STRING, allowNull: false },
  client_email: { type: DataTypes.STRING },
  client_phone: { type: DataTypes.STRING },
  client_dob: { type: DataTypes.DATEONLY },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  contract_date: { type: DataTypes.DATEONLY },
  total_amount: { type: DataTypes.DECIMAL(10, 2) },
  amount_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  payment_plan: { type: DataTypes.ENUM('full', 'monthly', 'quarterly', 'annual'), defaultValue: 'full' },
  services_included: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'fulfilled', 'cancelled', 'transferred'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// 6. Monument/Marker Orders
const MonumentOrder = sequelize.define('MonumentOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING, unique: true },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  deceased_name: { type: DataTypes.STRING },
  marker_type: { type: DataTypes.ENUM('headstone', 'flat_marker', 'monument', 'bench', 'plaque', 'veteran_marker'), defaultValue: 'headstone' },
  material: { type: DataTypes.STRING },
  inscription: { type: DataTypes.TEXT },
  vendor: { type: DataTypes.STRING },
  order_date: { type: DataTypes.DATEONLY },
  expected_delivery: { type: DataTypes.DATEONLY },
  installation_date: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('ordered', 'in_production', 'delivered', 'installed', 'cancelled'), defaultValue: 'ordered' },
  notes: { type: DataTypes.TEXT }
});

// 7. Perpetual Care Fund
const PerpetualCareFund = sequelize.define('PerpetualCareFund', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fund_name: { type: DataTypes.STRING, allowNull: false },
  account_number: { type: DataTypes.STRING },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  contributor_name: { type: DataTypes.STRING },
  contribution_amount: { type: DataTypes.DECIMAL(10, 2) },
  contribution_date: { type: DataTypes.DATEONLY },
  current_balance: { type: DataTypes.DECIMAL(12, 2) },
  interest_rate: { type: DataTypes.DECIMAL(5, 2) },
  last_disbursement: { type: DataTypes.DATEONLY },
  disbursement_amount: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('active', 'depleted', 'frozen'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// 8. Grounds Maintenance
const GroundsMaintenance = sequelize.define('GroundsMaintenance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_name: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING },
  task_type: { type: DataTypes.ENUM('mowing', 'trimming', 'planting', 'irrigation', 'snow_removal', 'leaf_cleanup', 'fertilizing', 'pest_control', 'general'), defaultValue: 'general' },
  scheduled_date: { type: DataTypes.DATEONLY },
  completed_date: { type: DataTypes.DATEONLY },
  assigned_to: { type: DataTypes.STRING },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  estimated_hours: { type: DataTypes.DECIMAL(5, 2) },
  actual_hours: { type: DataTypes.DECIMAL(5, 2) },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT }
});

// 9. Flower Placement Records
const FlowerPlacement = sequelize.define('FlowerPlacement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  deceased_name: { type: DataTypes.STRING },
  placed_by: { type: DataTypes.STRING },
  flower_type: { type: DataTypes.STRING },
  arrangement_type: { type: DataTypes.ENUM('bouquet', 'wreath', 'spray', 'potted', 'artificial', 'standing'), defaultValue: 'bouquet' },
  placement_date: { type: DataTypes.DATEONLY },
  removal_date: { type: DataTypes.DATEONLY },
  occasion: { type: DataTypes.STRING },
  vendor: { type: DataTypes.STRING },
  cost: { type: DataTypes.DECIMAL(8, 2) },
  status: { type: DataTypes.ENUM('placed', 'wilted', 'removed', 'permanent'), defaultValue: 'placed' },
  notes: { type: DataTypes.TEXT }
});

// 10. Chapel/Ceremony Scheduling
const CeremonySchedule = sequelize.define('CeremonySchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_name: { type: DataTypes.STRING, allowNull: false },
  event_type: { type: DataTypes.ENUM('funeral', 'memorial', 'celebration_of_life', 'graveside', 'committal', 'wake', 'other'), defaultValue: 'funeral' },
  venue: { type: DataTypes.ENUM('main_chapel', 'small_chapel', 'graveside', 'mausoleum', 'garden', 'reception_hall'), defaultValue: 'main_chapel' },
  scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
  deceased_name: { type: DataTypes.STRING },
  contact_name: { type: DataTypes.STRING },
  contact_phone: { type: DataTypes.STRING },
  expected_attendees: { type: DataTypes.INTEGER },
  officiant: { type: DataTypes.STRING },
  special_requirements: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled'), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT }
});

// 11. Vendor Management
const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  company_name: { type: DataTypes.STRING, allowNull: false },
  vendor_type: { type: DataTypes.ENUM('vault', 'florist', 'monument', 'casket', 'urn', 'catering', 'landscaping', 'transportation', 'other'), defaultValue: 'other' },
  contact_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  license_number: { type: DataTypes.STRING },
  insurance_expiry: { type: DataTypes.DATEONLY },
  contract_start: { type: DataTypes.DATEONLY },
  contract_end: { type: DataTypes.DATEONLY },
  rating: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// 12. Compliance Records
const ComplianceRecord = sequelize.define('ComplianceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regulation_name: { type: DataTypes.STRING, allowNull: false },
  regulation_type: { type: DataTypes.ENUM('state', 'federal', 'local', 'environmental', 'health', 'osha'), defaultValue: 'state' },
  description: { type: DataTypes.TEXT },
  compliance_status: { type: DataTypes.ENUM('compliant', 'non_compliant', 'pending_review', 'under_remediation'), defaultValue: 'compliant' },
  last_audit_date: { type: DataTypes.DATEONLY },
  next_audit_date: { type: DataTypes.DATEONLY },
  responsible_person: { type: DataTypes.STRING },
  documentation_path: { type: DataTypes.STRING },
  corrective_action: { type: DataTypes.TEXT },
  fine_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  notes: { type: DataTypes.TEXT }
});

// 13. Memorial Events
const MemorialEvent = sequelize.define('MemorialEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_name: { type: DataTypes.STRING, allowNull: false },
  event_type: { type: DataTypes.ENUM('memorial_day', 'veterans_day', 'holiday', 'anniversary', 'community', 'fundraiser', 'tour', 'other'), defaultValue: 'other' },
  event_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
  location: { type: DataTypes.STRING },
  organizer: { type: DataTypes.STRING },
  expected_attendees: { type: DataTypes.INTEGER },
  budget: { type: DataTypes.DECIMAL(10, 2) },
  actual_cost: { type: DataTypes.DECIMAL(10, 2) },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('planning', 'confirmed', 'completed', 'cancelled'), defaultValue: 'planning' },
  notes: { type: DataTypes.TEXT }
});

// 14. Genealogy Records
const GenealogyRecord = sequelize.define('GenealogyRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  person_name: { type: DataTypes.STRING, allowNull: false },
  birth_date: { type: DataTypes.DATEONLY },
  death_date: { type: DataTypes.DATEONLY },
  birth_place: { type: DataTypes.STRING },
  death_place: { type: DataTypes.STRING },
  father_name: { type: DataTypes.STRING },
  mother_name: { type: DataTypes.STRING },
  spouse_name: { type: DataTypes.STRING },
  children: { type: DataTypes.TEXT },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  burial_record_id: { type: DataTypes.INTEGER, references: { model: 'BurialRecords', key: 'id' } },
  occupation: { type: DataTypes.STRING },
  military_service: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

// 15. Payment Plans
const PaymentPlan = sequelize.define('PaymentPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_number: { type: DataTypes.STRING, unique: true },
  client_name: { type: DataTypes.STRING, allowNull: false },
  client_email: { type: DataTypes.STRING },
  client_phone: { type: DataTypes.STRING },
  deed_id: { type: DataTypes.INTEGER, references: { model: 'Deeds', key: 'id' } },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  down_payment: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  monthly_payment: { type: DataTypes.DECIMAL(10, 2) },
  total_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  remaining_balance: { type: DataTypes.DECIMAL(10, 2) },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  payment_frequency: { type: DataTypes.ENUM('weekly', 'bi_weekly', 'monthly', 'quarterly'), defaultValue: 'monthly' },
  status: { type: DataTypes.ENUM('active', 'paid_off', 'delinquent', 'cancelled'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// 16. Cremation Niche Management
const CremationNiche = sequelize.define('CremationNiche', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  niche_number: { type: DataTypes.STRING, allowNull: false },
  columbarium_name: { type: DataTypes.STRING },
  level: { type: DataTypes.STRING },
  position: { type: DataTypes.STRING },
  size: { type: DataTypes.ENUM('single', 'double', 'family'), defaultValue: 'single' },
  status: { type: DataTypes.ENUM('available', 'sold', 'occupied', 'reserved'), defaultValue: 'available' },
  occupant_name: { type: DataTypes.STRING },
  date_of_inurnment: { type: DataTypes.DATEONLY },
  urn_type: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2) },
  owner_name: { type: DataTypes.STRING },
  owner_phone: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

// 17. Veteran Section Management
const VeteranRecord = sequelize.define('VeteranRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  veteran_name: { type: DataTypes.STRING, allowNull: false },
  service_number: { type: DataTypes.STRING },
  branch: { type: DataTypes.ENUM('army', 'navy', 'air_force', 'marines', 'coast_guard', 'space_force', 'national_guard'), defaultValue: 'army' },
  rank: { type: DataTypes.STRING },
  war_conflict: { type: DataTypes.STRING },
  enlistment_date: { type: DataTypes.DATEONLY },
  discharge_date: { type: DataTypes.DATEONLY },
  discharge_type: { type: DataTypes.STRING },
  date_of_birth: { type: DataTypes.DATEONLY },
  date_of_death: { type: DataTypes.DATEONLY },
  plot_id: { type: DataTypes.INTEGER, references: { model: 'Plots', key: 'id' } },
  va_claim_number: { type: DataTypes.STRING },
  headstone_type: { type: DataTypes.STRING },
  flag_holder: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: { type: DataTypes.TEXT }
});

// 18. Deed Transfers
const DeedTransfer = sequelize.define('DeedTransfer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deed_id: { type: DataTypes.INTEGER, references: { model: 'Deeds', key: 'id' } },
  transfer_number: { type: DataTypes.STRING, unique: true },
  from_owner: { type: DataTypes.STRING, allowNull: false },
  to_owner: { type: DataTypes.STRING, allowNull: false },
  to_owner_email: { type: DataTypes.STRING },
  to_owner_phone: { type: DataTypes.STRING },
  transfer_date: { type: DataTypes.DATEONLY },
  transfer_type: { type: DataTypes.ENUM('sale', 'inheritance', 'gift', 'court_order'), defaultValue: 'sale' },
  transfer_fee: { type: DataTypes.DECIMAL(10, 2) },
  legal_document: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'approved', 'completed', 'rejected'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT }
});

// 19. User (for auth)
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('admin', 'manager', 'staff', 'viewer'), defaultValue: 'admin' }
});

// Associations
Plot.hasMany(BurialRecord, { foreignKey: 'plot_id' });
BurialRecord.belongsTo(Plot, { foreignKey: 'plot_id' });
Plot.hasMany(Deed, { foreignKey: 'plot_id' });
Deed.belongsTo(Plot, { foreignKey: 'plot_id' });

module.exports = {
  sequelize,
  Plot,
  BurialRecord,
  Deed,
  IntermentSchedule,
  PreNeedContract,
  MonumentOrder,
  PerpetualCareFund,
  GroundsMaintenance,
  FlowerPlacement,
  CeremonySchedule,
  Vendor,
  ComplianceRecord,
  MemorialEvent,
  GenealogyRecord,
  PaymentPlan,
  CremationNiche,
  VeteranRecord,
  DeedTransfer,
  User
};
