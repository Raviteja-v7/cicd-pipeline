const request = require('supertest');
const app = require('../../src/app');
const itemRoutes = require('../../src/routes/items');

describe('Integration: Full API Workflow', () => {
  beforeEach(() => {
    itemRoutes._resetItems();
  });

  it('should support full CRUD lifecycle', async () => {
    // 1. Create a new item
    const createRes = await request(app)
      .post('/api/items')
      .send({ name: 'Integration Test Item', status: 'pending' });

    expect(createRes.status).toBe(201);
    const itemId = createRes.body.data.id;

    // 2. Read the item back
    const readRes = await request(app).get(`/api/items/${itemId}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.name).toBe('Integration Test Item');

    // 3. Update the item
    const updateRes = await request(app)
      .put(`/api/items/${itemId}`)
      .send({ status: 'active' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('active');

    // 4. Verify in list
    const listRes = await request(app).get('/api/items?status=active');
    const found = listRes.body.data.find((i) => i.id === itemId);
    expect(found).toBeDefined();

    // 5. Delete the item
    const deleteRes = await request(app).delete(`/api/items/${itemId}`);
    expect(deleteRes.status).toBe(200);

    // 6. Confirm deletion
    const confirmRes = await request(app).get(`/api/items/${itemId}`);
    expect(confirmRes.status).toBe(404);
  });

  it('should handle concurrent operations correctly', async () => {
    // Create multiple items simultaneously
    const createPromises = Array.from({ length: 5 }, (_, i) =>
      request(app)
        .post('/api/items')
        .send({ name: `Concurrent Item ${i}`, status: 'pending' })
    );

    const results = await Promise.all(createPromises);

    results.forEach((res) => {
      expect(res.status).toBe(201);
    });

    // All should be listed
    const listRes = await request(app).get('/api/items');
    expect(listRes.body.total).toBe(8); // 3 default + 5 new
  });

  it('should enforce API health under load', async () => {
    // Hit health endpoint multiple times
    const healthPromises = Array.from({ length: 10 }, () =>
      request(app).get('/health')
    );

    const results = await Promise.all(healthPromises);
    results.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
