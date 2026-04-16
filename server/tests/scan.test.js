process.env.VIRUSTOTAL_KEY = '';
process.env.ML_SERVICE_URL = '';

const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const request = require('supertest');
const app = require('../src/app');
const { summarizeVirusTotalStats } = require('../src/services/threatIntel');

describe('summarizeVirusTotalStats', () => {
  test('flags malicious when any engine reports malicious', () => {
    const s = summarizeVirusTotalStats({
      malicious: 2,
      suspicious: 1,
      harmless: 5,
      undetected: 10,
      timeout: 0
    });
    expect(s.verdict).toBe('malicious');
    expect(s.shortMessage).toMatch(/2 of 18/);
  });

  test('uses suspicious when no malicious', () => {
    const s = summarizeVirusTotalStats({
      malicious: 0,
      suspicious: 3,
      harmless: 5,
      undetected: 10,
      timeout: 0
    });
    expect(s.verdict).toBe('suspicious');
  });

  test('clean when no malicious or suspicious', () => {
    const s = summarizeVirusTotalStats({
      malicious: 0,
      suspicious: 0,
      harmless: 20,
      undetected: 40,
      timeout: 0
    });
    expect(s.verdict).toBe('clean');
  });
});

describe('POST /api/scan', () => {
  test('rejects attachment with unsupported file extension', async () => {
    const raw = Buffer.from('hello').toString('base64');
    const res = await request(app)
      .post('/api/scan')
      .send({
        inputType: 'attachment',
        raw,
        fileName: 'malware.unknownextzzz',
        fileMime: ''
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/not supported/i);
  });

  test('accepts attachment with allowed extension', async () => {
    const raw = Buffer.from('hello').toString('base64');
    const res = await request(app)
      .post('/api/scan')
      .send({
        inputType: 'attachment',
        raw,
        fileName: 'notes.txt',
        fileMime: 'text/plain'
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

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
