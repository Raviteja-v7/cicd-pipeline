const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory store (replace with DB in production)
let items = [
  { id: 1, name: 'Deploy Pipeline', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, name: 'Run Tests', status: 'completed', createdAt: new Date().toISOString() },
  { id: 3, name: 'Build Image', status: 'pending', createdAt: new Date().toISOString() },
];
let nextId = 4;

// GET /api/items - List all items
router.get('/', (req, res) => {
  const { status } = req.query;

  let result = items;
  if (status) {
    result = items.filter((item) => item.status === status);
  }

  logger.info(`Listed ${result.length} items`);
  res.json({ data: result, total: result.length });
});

// GET /api/items/:id - Get single item
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ data: item });
});

// POST /api/items - Create item
router.post('/', (req, res) => {
  const { name, status } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }

  const validStatuses = ['active', 'pending', 'completed'];
  const itemStatus = status || 'pending';

  if (!validStatuses.includes(itemStatus)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const newItem = {
    id: nextId++,
    name: name.trim(),
    status: itemStatus,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  logger.info(`Created item: ${newItem.id} - ${newItem.name}`);
  res.status(201).json({ data: newItem });
});

// PUT /api/items/:id - Update item
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, status } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    items[index].name = name.trim();
  }

  if (status !== undefined) {
    const validStatuses = ['active', 'pending', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
    items[index].status = status;
  }

  items[index].updatedAt = new Date().toISOString();
  logger.info(`Updated item: ${id}`);
  res.json({ data: items[index] });
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const deleted = items.splice(index, 1)[0];
  logger.info(`Deleted item: ${id}`);
  res.json({ data: deleted, message: 'Item deleted successfully' });
});

// Export for testing - allows resetting state
router._resetItems = () => {
  items = [
    { id: 1, name: 'Deploy Pipeline', status: 'active', createdAt: new Date().toISOString() },
    { id: 2, name: 'Run Tests', status: 'completed', createdAt: new Date().toISOString() },
    { id: 3, name: 'Build Image', status: 'pending', createdAt: new Date().toISOString() },
  ];
  nextId = 4;
};

module.exports = router;
