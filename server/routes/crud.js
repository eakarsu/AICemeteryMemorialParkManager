const express = require('express');
const authMiddleware = require('../middleware/auth');

function createCrudRouter(Model, options = {}) {
  const router = express.Router();
  router.use(authMiddleware);

  // GET all
  router.get('/', async (req, res) => {
    try {
      const items = await Model.findAll({
        order: [['id', 'DESC']],
        ...(options.include ? { include: options.include } : {})
      });
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
