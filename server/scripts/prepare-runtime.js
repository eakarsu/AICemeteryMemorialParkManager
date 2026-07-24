'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function prepareRuntime() {
  if (process.env.MIGRATE_ON_START !== 'true') return;

  await sequelize.sync();
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  for (const filename of fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()) {
    await sequelize.query(fs.readFileSync(path.join(migrationsDir, filename), 'utf8'));
  }

  const email = process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      await existing.update({ password: passwordHash, role: 'admin' });
    } else {
      await User.create({ email: normalizedEmail, password: passwordHash, first_name: 'Runtime', last_name: 'Administrator', role: 'admin' });
    }
  }
}

prepareRuntime()
  .catch((error) => {
    console.error(`Runtime preparation failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
