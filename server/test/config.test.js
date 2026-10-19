import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

test('loads valid configuration and derives secure cookie default by environment', () => {
  const config = loadConfig({
    NODE_ENV: 'production',
    MONGODB_URI: 'mongodb://localhost/blogsphere',
    JWT_SECRET: 'a-secret-value-that-is-more-than-32-characters',
    CLIENT_ORIGIN: 'https://blogsphere.example'
  });
  assert.equal(config.PORT, 5000);
  assert.equal(config.COOKIE_SECURE, true);
});

test('rejects a short JWT secret', () => {
  assert.throws(
    () => loadConfig({ MONGODB_URI: 'mongodb://localhost/blogsphere', JWT_SECRET: 'short' }),
    /JWT_SECRET must be at least 32 characters/
  );
});
