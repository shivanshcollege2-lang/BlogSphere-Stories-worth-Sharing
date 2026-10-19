import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createAuthRouter } from './routes/auth.js';
import { createPostsRouter } from './routes/posts.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
  app.use('/api', (request, response, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next();
    const origin = request.get('origin');
    if (origin && origin !== config.CLIENT_ORIGIN) {
      return response.status(403).json({ success: false, error: { message: 'This request origin is not allowed.' } });
    }
    return next();
  });
  app.use(express.json({ limit: '40kb' }));
  app.use(cookieParser());
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }), createAuthRouter(config));
  app.use('/api/posts', createPostsRouter(config));
  app.get('/api/health', (_request, response) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    return response.status(databaseConnected ? 200 : 503).json({
      success: databaseConnected,
      data: { status: databaseConnected ? 'ok' : 'degraded', database: databaseConnected ? 'connected' : 'disconnected' }
    });
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
