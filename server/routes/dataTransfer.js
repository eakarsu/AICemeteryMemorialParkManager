/**
 * Import/Export routes for burial records and other data.
 *
 * GET  /api/export/burial-records  - CSV export of burial records
 * POST /api/import/records         - Import CSV records (validate before insert)
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { BurialRecord, Plot } = require('../models');

router.use(authMiddleware);

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(row, headers) {
  return headers.map(h => escapeCsvField(row[h])).join(',');
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser (handles quoted fields)
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') {
        if (inQuotes && line[c + 1] === '"') { current += '"'; c++; }
        else inQuotes = !inQuotes;
      } else if (line[c] === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += line[c];
      }
    }
    fields.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => { row[h] = fields[idx] || null; });
    rows.push(row);
  }

  return { headers, rows };
}

// ─── GET /api/export/burial-records ──────────────────────────────────────────

router.get('/burial-records', async (req, res) => {
  try {
    const { status, date_from, date_to, format = 'csv' } = req.query;

    const where = {};
    if (status) where.status = status;

    const records = await BurialRecord.findAll({
      where,
      order: [['date_of_burial', 'DESC']],
      include: [{ model: Plot, as: 'Plot', required: false }]
    });

    const csvHeaders = [
      'id', 'deceased_first_name', 'deceased_last_name', 'date_of_birth', 'date_of_death',
      'date_of_burial', 'plot_id', 'cause_of_death', 'funeral_home', 'veteran',
      'veteran_branch', 'next_of_kin', 'next_of_kin_phone', 'notes', 'createdAt'
    ];

    const csvRows = records.map(r => rowToCsv(r.toJSON(), csvHeaders));
    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="burial-records-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/import/records ─────────────────────────────────────────────────

router.post('/records', requireRole('operator'), async (req, res) => {
  try {
    const { csv_data, dry_run = false } = req.body;
    if (!csv_data) return res.status(400).json({ error: 'csv_data is required in request body' });

    const { headers, rows } = parseCsv(csv_data);

    // Required fields for burial records
    const REQUIRED_FIELDS = ['deceased_first_name', 'deceased_last_name'];
    const missingColumns = REQUIRED_FIELDS.filter(f => !headers.includes(f));
    if (missingColumns.length) {
      return res.status(400).json({
        error: 'CSV is missing required columns',
        missing_columns: missingColumns,
        provided_columns: headers
      });
    }

    // Validate all rows first
    const errors = [];
    const validRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowErrors = [];

      if (!row.deceased_first_name) rowErrors.push('deceased_first_name is required');
      if (!row.deceased_last_name) rowErrors.push('deceased_last_name is required');

      // Validate date formats
      const dateFields = ['date_of_birth', 'date_of_death', 'date_of_burial'];
      for (const df of dateFields) {
        if (row[df] && !/^\d{4}-\d{2}-\d{2}$/.test(row[df])) {
          rowErrors.push(`${df} must be in YYYY-MM-DD format, got: "${row[df]}"`);
        }
      }

      // Validate boolean fields
      if (row.veteran && !['true', 'false', '1', '0', 'yes', 'no', ''].includes(row.veteran.toLowerCase())) {
        rowErrors.push(`veteran must be true/false/yes/no, got: "${row.veteran}"`);
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 2, errors: rowErrors, data: row }); // +2 because row 1 is header
      } else {
        // Normalize boolean
        if (row.veteran) row.veteran = ['true', '1', 'yes'].includes(row.veteran.toLowerCase());
        // Remove id field if present (auto-generated)
        delete row.id;
        delete row.createdAt;
        delete row.updatedAt;
        validRows.push(row);
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        error: 'Validation failed',
        validation_errors: errors,
        valid_rows: validRows.length,
        error_rows: errors.length
      });
    }

    if (dry_run) {
      return res.json({
        message: 'Dry run completed — no records inserted',
        rows_to_import: validRows.length,
        preview: validRows.slice(0, 5)
      });
    }

    // Bulk insert valid rows
    const created = await BurialRecord.bulkCreate(validRows, { validate: true });

    res.status(201).json({
      message: `Successfully imported ${created.length} burial records`,
      imported: created.length,
      total_rows: rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
