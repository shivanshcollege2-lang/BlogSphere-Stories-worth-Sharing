import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp({
  JWT_SECRET: 'a-test-secret-that-is-long-enough-for-the-application',
  CLIENT_ORIGIN: 'http://localhost:5173',
  COOKIE_SECURE: false
});

test('rejects requests to private routes without an authenticated cookie', async () => {
  const response = await request(app).get('/api/posts/mine');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('validates registration before attempting database persistence', async () => {
  const response = await request(app).post('/api/auth/register').send({
    name: 'A',
    email: 'not-an-email',
    password: 'short'
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.ok(response.body.error.details.length >= 2);
});

test('rejects state-changing browser requests from an untrusted origin', async () => {
  const response = await request(app)
    .post('/api/auth/logout')
    .set('Origin', 'https://untrusted.example');
  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test('allows the localhost development origin used by the Vite preview', async () => {
  const response = await request(app)
    .post('/api/auth/logout')
    .set('Origin', 'http://localhost:5173');
  assert.equal(response.status, 200);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('returns a consistent not-found response for unknown API routes', async () => {
  const response = await request(app).get('/api/no-such-route');
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test('reports an unavailable database as degraded health', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 503);
  assert.deepEqual(response.body.data, {
    status: 'degraded',
    database: 'disconnected',
    demo: false
  });
});
