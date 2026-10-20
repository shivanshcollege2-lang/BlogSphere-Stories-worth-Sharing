import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { seedDemoData } from './demoContent.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The in-memory demo server must not be used in production.');
}

const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = mongo.getUri();
process.env.JWT_SECRET = 'local-only-demo-secret-change-before-production-0001';
process.env.CLIENT_ORIGIN = 'http://127.0.0.1:5173';
process.env.PORT = '5000';

const config = { ...loadConfig(), DEMO_MODE: true };
await mongoose.connect(config.MONGODB_URI);
const { postCount } = await seedDemoData();
const app = createApp(config);
const server = app.listen(config.PORT, '127.0.0.1', () => {
  console.log(`BlogSphere local demo API: http://127.0.0.1:${config.PORT}`);
  console.log(`Temporary in-memory database ready with ${postCount} sample stories.`);
  console.log(`Demo sign-in: ${'writer@blogsphere.local'} / ${'BlogSphereDemo123!'}`);
  console.log('Demo data is erased when this process stops. Do not use these credentials in production.');
});

async function shutdown() {
  server.close(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
