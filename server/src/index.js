import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp(config);

try {
  await mongoose.connect(config.MONGODB_URI);
  app.listen(config.PORT, () => {
    console.log(`BlogSphere API listening on http://localhost:${config.PORT}`);
  });
} catch (error) {
  console.error('Unable to connect to MongoDB. Check MONGODB_URI and ensure MongoDB is running.', error);
  process.exitCode = 1;
}
