import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import BlogPost from '../src/models/BlogPost.js';
import User from '../src/models/User.js';
import { DEMO_CREDENTIALS, seedDemoData } from '../src/demoContent.js';

const config = {
  JWT_SECRET: 'a-test-secret-that-is-long-enough-for-the-application',
  CLIENT_ORIGIN: 'http://localhost:5173',
  COOKIE_SECURE: false
};
const app = createApp(config);
let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, { timeout: 120_000 });

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), BlogPost.deleteMany({})]);
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('starts the HTTP API and reports its live MongoDB connection', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      data: { status: 'ok', database: 'connected', demo: false }
    });
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('seeds an idempotent demo writer and three readable stories', async () => {
  const first = await seedDemoData();
  const second = await seedDemoData();
  assert.equal(first.author.email, DEMO_CREDENTIALS.email);
  assert.equal(first.postCount, 3);
  assert.equal(second.postCount, 3);
  assert.equal(await User.countDocuments({ email: DEMO_CREDENTIALS.email }), 1);
  assert.equal(await BlogPost.countDocuments({ author: first.author.id }), 3);
});

async function register(name, email) {
  return request(app).post('/api/auth/register').send({
    name,
    email,
    password: 'a-secure-test-password'
  });
}

test('registers and signs in a user with a hashed password and an HTTP-only cookie', async () => {
  const response = await register('Avery Writer', 'avery@example.com');
  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.email, 'avery@example.com');
  assert.equal(response.body.data.user.password, undefined);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/i);

  const storedUser = await User.findById(response.body.data.user._id).select('+password');
  assert.notEqual(storedUser.password, 'a-secure-test-password');
  assert.match(storedUser.password, /^\$2[aby]\$/);

  const current = await request(app)
    .get('/api/auth/me')
    .set('Cookie', response.headers['set-cookie']);
  assert.equal(current.status, 200);
  assert.equal(current.body.data.user._id, storedUser.id);
});

test('logs in, rejects invalid credentials, and terminates the session on logout', async () => {
  await register('Avery Writer', 'avery@example.com');
  const invalid = await request(app).post('/api/auth/login').send({
    email: 'avery@example.com',
    password: 'not-the-password'
  });
  assert.equal(invalid.status, 401);

  const login = await request(app).post('/api/auth/login').send({
    email: 'avery@example.com',
    password: 'a-secure-test-password'
  });
  assert.equal(login.status, 200);
  const logout = await request(app)
    .post('/api/auth/logout')
    .set('Cookie', login.headers['set-cookie']);
  assert.equal(logout.status, 200);

  const current = await request(app)
    .get('/api/auth/me')
    .set('Cookie', logout.headers['set-cookie']);
  assert.equal(current.status, 401);
});

test('persists, reads, updates and deletes posts while enforcing author ownership', async () => {
  const owner = await register('Avery Writer', 'avery@example.com');
  const other = await register('Jordan Reader', 'jordan@example.com');
  const postInput = {
    title: 'A Small Practice of Paying Attention',
    content: 'Some days the most important thing we can do is slow down and look again. Attention makes room for wonder, and wonder can change how an ordinary day feels.',
    category: 'Ideas',
    tags: ['attention', 'reflection']
  };

  const unauthenticated = await request(app).post('/api/posts').send(postInput);
  assert.equal(unauthenticated.status, 401);

  const created = await request(app)
    .post('/api/posts')
    .set('Cookie', owner.headers['set-cookie'])
    .send(postInput);
  assert.equal(created.status, 201);
  const postId = created.body.data.post._id;

  const mine = await request(app)
    .get('/api/posts/mine')
    .set('Cookie', owner.headers['set-cookie']);
  assert.equal(mine.status, 200);
  assert.equal(mine.body.data.posts.length, 1);

  const publicPost = await request(app).get(`/api/posts/${postId}`);
  assert.equal(publicPost.status, 200);
  assert.equal(publicPost.body.data.post.author.name, 'Avery Writer');

  const filtered = await request(app).get('/api/posts?category=Ideas&q=attention');
  assert.equal(filtered.status, 200);
  assert.equal(filtered.body.data.posts.length, 1);

  const updated = await request(app)
    .put(`/api/posts/${postId}`)
    .set('Cookie', owner.headers['set-cookie'])
    .send({ ...postInput, title: 'A More Attentive Kind of Day' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.post.title, 'A More Attentive Kind of Day');

  const forbiddenEdit = await request(app)
    .put(`/api/posts/${postId}`)
    .set('Cookie', other.headers['set-cookie'])
    .send(postInput);
  assert.equal(forbiddenEdit.status, 403);

  const forbiddenDelete = await request(app)
    .delete(`/api/posts/${postId}`)
    .set('Cookie', other.headers['set-cookie']);
  assert.equal(forbiddenDelete.status, 403);

  const deleted = await request(app)
    .delete(`/api/posts/${postId}`)
    .set('Cookie', owner.headers['set-cookie']);
  assert.equal(deleted.status, 200);
  assert.equal((await request(app).get(`/api/posts/${postId}`)).status, 404);
});
