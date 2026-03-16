const request = require('supertest');
const app = require('../../src/app');
const itemRoutes = require('../../src/routes/items');

describe('Items API', () => {
  // Reset state before each test
  beforeEach(() => {
    itemRoutes._resetItems();
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.total).toBe(3);
    });

    it('should filter items by status', async () => {
      const res = await request(app).get('/api/items?status=active');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('active');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const res = await request(app).get('/api/items/1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.name).toBe('Deploy Pipeline');
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app).get('/api/items/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'New Task', status: 'active' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Task');
      expect(res.body.data.status).toBe('active');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('should default status to pending', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'Another Task' });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'Task', status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an item', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({ name: 'Updated Pipeline', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Pipeline');
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .put('/api/items/999')
        .send({ name: 'Nope' });

      expect(res.status).toBe(404);
    });

    it('should reject invalid status on update', async () => {
      const res = await request(app)
        .put('/api/items/1')
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an item', async () => {
      const res = await request(app).delete('/api/items/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Item deleted successfully');

      // Verify it's gone
      const check = await request(app).get('/api/items/1');
      expect(check.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app).delete('/api/items/999');

      expect(res.status).toBe(404);
    });
  });
});
