const request = require('supertest');
const app = require('../src/app');

describe('POST /api/scan', () => {
  test('accepts a URL and returns a log', async () => {
    const res = await request(app)
      .post('/api/scan')
      .send({ inputType: 'url', raw: 'http://example.com/login' })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.log).toBeDefined();
    expect(res.body.log.result).toBeDefined();
  });
});
