const express = require('express');
const authMiddleware = require('../middleware/auth');
const { defaultRbac } = require('../middleware/roleCheck');

function createCrudRouter(Model, options = {}) {
  const router = express.Router();
  router.use(authMiddleware);
  router.use(defaultRbac);

  // GET all — with pagination support (?page=1&limit=20)
  router.get('/', async (req, res) => {
    try {
      const { page, limit = 20, search } = req.query;
      const findOptions = {
        order: [['id', 'DESC']],
        ...(options.include ? { include: options.include } : {})
      };

      if (page) {
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        findOptions.limit = limitNum;
        findOptions.offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Model.findAndCountAll(findOptions);
        return res.json({
          data: rows,
          pagination: {
            total: count,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(count / limitNum)
          }
        });
      }

      const items = await Model.findAll(findOptions);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id, {
        ...(options.include ? { include: options.include } : {})
      });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
