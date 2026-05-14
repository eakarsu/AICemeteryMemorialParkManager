/**
 * Role-Based Access Control middleware.
 *
 * Roles:
 *   admin     - all operations (create, read, update, delete)
 *   operator  - create and edit, but NOT delete
 *   view-only - read only (GET requests only)
 *
 * Usage:
 *   router.delete('/:id', requireRole('admin'), handler)
 *   router.post('/', requireRole('operator'), handler)   // operator + admin
 *   router.get('/', requireRole('view-only'), handler)   // any authenticated user
 */

const ROLE_LEVELS = {
  'view-only': 1,
  'viewer': 1,   // alias used in User model
  operator: 2,
  manager: 2,    // alias
  staff: 2,      // alias
  admin: 3
};

/**
 * Returns middleware that allows access if req.user.role meets minimum level.
 * @param {string} minRole - minimum role required ('view-only', 'operator', or 'admin')
 */
function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userLevel = ROLE_LEVELS[req.user.role] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 99;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required_role: minRole,
        your_role: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware that auto-blocks DELETE for non-admins and blocks writes for view-only.
 * Apply to any router to get default RBAC protection.
 */
function defaultRbac(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  const method = req.method.toUpperCase();
  const role = req.user.role;
  const level = ROLE_LEVELS[role] || 0;

  // DELETE requires admin
  if (method === 'DELETE' && level < ROLE_LEVELS.admin) {
    return res.status(403).json({ error: 'Only admins can delete records', your_role: role });
  }

  // POST/PUT/PATCH requires at least operator
  if (['POST', 'PUT', 'PATCH'].includes(method) && level < ROLE_LEVELS.operator) {
    return res.status(403).json({ error: 'View-only users cannot modify records', your_role: role });
  }

  next();
}

module.exports = { requireRole, defaultRbac };
