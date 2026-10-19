import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { createAuthMiddleware } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(72)
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72)
});

export function createAuthRouter(config) {
  const router = Router();
  const requireAuth = createAuthMiddleware(config.JWT_SECRET);
  const cookieOptions = {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  router.post('/register', async (request, response, next) => {
    try {
      const input = registerSchema.parse(request.body);
      const user = await User.create({
        name: input.name,
        email: input.email.toLowerCase(),
        password: input.password
      });
      const token = jwt.sign({}, config.JWT_SECRET, { subject: user.id, expiresIn: '7d' });
      response.cookie('blogsphere_token', token, cookieOptions);
      return response.status(201).json({ success: true, data: { user } });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/login', async (request, response, next) => {
    try {
      const input = loginSchema.parse(request.body);
      const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return response.status(401).json({ success: false, error: { message: 'Email or password is incorrect.' } });
      }
      const token = jwt.sign({}, config.JWT_SECRET, { subject: user.id, expiresIn: '7d' });
      response.cookie('blogsphere_token', token, cookieOptions);
      return response.json({ success: true, data: { user } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/me', requireAuth, (request, response) => {
    response.json({ success: true, data: { user: request.user } });
  });

  router.post('/logout', (_request, response) => {
    response.clearCookie('blogsphere_token', {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/'
    });
    response.json({ success: true, data: { message: 'You have been signed out.' } });
  });

  return router;
}
