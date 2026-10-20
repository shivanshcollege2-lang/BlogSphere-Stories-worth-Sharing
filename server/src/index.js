import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
const config = loadConfig();
const app = createApp(config);

try {
  await mongoose.connect(config.MONGODB_URI);
  app.listen(config.PORT, () => {
    console.log(`BlogSphere API listening on http://localhost:${config.PORT}`);
  });
} catch (error) {
  console.error(`Unable to connect to MongoDB (${error.name}). Check MONGODB_URI and ensure MongoDB is running.`);
  process.exitCode = 1;
}
