/**
 * Draft/Approval workflow for obituaries.
 *
 * POST   /api/obituaries          - Create a draft obituary
 * GET    /api/obituaries          - List all obituaries (paginated)
 * GET    /api/obituaries/pending  - List pending approval obituaries
 * GET    /api/obituaries/:id      - Get single obituary
 * PUT    /api/obituaries/:id      - Update obituary
 * PUT    /api/obituaries/:id/approve - Approve an obituary
 * DELETE /api/obituaries/:id      - Delete (admin only via RBAC)
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole, defaultRbac } = require('../middleware/roleCheck');
const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

router.use(authMiddleware);
router.use(defaultRbac);

// ─── Model (lazy-defined) ─────────────────────────────────────────────────────

let Obituary;
function getModel() {
  if (Obituary) return Obituary;
  Obituary = sequelize.define('Obituary', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deceased_name: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATEONLY },
    death_date: { type: DataTypes.DATEONLY },
    biography: { type: DataTypes.TEXT },
    family_members: { type: DataTypes.TEXT },
    achievements: { type: DataTypes.TEXT },
    tone: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
      defaultValue: 'draft'
    },
    created_by: { type: DataTypes.INTEGER },
    approved_by: { type: DataTypes.INTEGER },
    approved_at: { type: DataTypes.DATE },
    rejection_reason: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT }
  }, { tableName: 'obituaries', timestamps: true, underscored: true });
  sequelize.sync();
  return Obituary;
}

function validateRequired(body, fields) {
  return fields.filter(f => !body[f]);
}

// ─── POST /api/obituaries ─────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const Model = getModel();
    const { deceased_name, birth_date, death_date, biography, family_members, achievements, tone, content, notes } = req.body;
    const missing = validateRequired(req.body, ['deceased_name']);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const obituary = await Model.create({
      deceased_name,
      birth_date: birth_date || null,
      death_date: death_date || null,
      biography,
      family_members,
      achievements,
      tone,
      content,
      notes,
      status: 'draft',
      created_by: req.user.id
    });

    res.status(201).json({ message: 'Obituary draft created', obituary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/obituaries/pending ─────────────────────────────────────────────

router.get('/pending', async (req, res) => {
  try {
    const Model = getModel();
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Model.findAndCountAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({
      pending: rows,
      pagination: { total: count, page: Number(page), limit: Number(limit), total_pages: Math.ceil(count / Number(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/obituaries ─────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const Model = getModel();
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Model.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({
      obituaries: rows,
      pagination: { total: count, page: Number(page), limit: Number(limit), total_pages: Math.ceil(count / Number(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/obituaries/:id ─────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const Model = getModel();
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Obituary not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/obituaries/:id ─────────────────────────────────────────────────

router.put('/:id', async (req, res) => {
  try {
    const Model = getModel();
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Obituary not found' });
    if (item.status === 'approved') {
      return res.status(400).json({ error: 'Cannot edit an approved obituary. Create a new draft.' });
    }
    await item.update(req.body);
    res.json({ message: 'Obituary updated', obituary: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/obituaries/:id/approve ─────────────────────────────────────────

router.put('/:id/approve', requireRole('operator'), async (req, res) => {
  try {
    const Model = getModel();
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Obituary not found' });

    const { action = 'approve', rejection_reason } = req.body;

    if (action === 'approve') {
      await item.update({
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date()
      });
      res.json({ message: 'Obituary approved', obituary: item });
    } else if (action === 'reject') {
      if (!rejection_reason) return res.status(400).json({ error: 'rejection_reason is required when rejecting' });
      await item.update({ status: 'rejected', rejection_reason });
      res.json({ message: 'Obituary rejected', obituary: item });
    } else {
      res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/obituaries/:id/submit ──────────────────────────────────────────

router.put('/:id/submit', async (req, res) => {
  try {
    const Model = getModel();
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Obituary not found' });
    if (item.status !== 'draft') return res.status(400).json({ error: 'Only drafts can be submitted for approval' });
    await item.update({ status: 'pending' });
    res.json({ message: 'Obituary submitted for approval', obituary: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/obituaries/:id ──────────────────────────────────────────────

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const Model = getModel();
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Obituary not found' });
    await item.destroy();
    res.json({ message: 'Obituary deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
