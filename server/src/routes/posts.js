import { Router } from 'express';
import { z } from 'zod';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import { createAuthMiddleware } from '../middleware/auth.js';

const postSchema = z.object({
  title: z.string().trim().min(5).max(140),
  content: z.string().min(50).max(30000),
  category: z.string().trim().min(2).max(40),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
  coverImageUrl: z.union([
    z.literal(''),
    z.string().url().max(2048).refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS image URL.')
  ]).default('')
});

export function createPostsRouter(config) {
  const router = Router();
  const requireAuth = createAuthMiddleware(config.JWT_SECRET);

  router.get('/', async (request, response, next) => {
    try {
      const query = typeof request.query.q === 'string' ? request.query.q.trim().slice(0, 100) : '';
      const category = typeof request.query.category === 'string' ? request.query.category.trim().slice(0, 40) : '';
      const filter = {};
      if (category && category !== 'All stories') filter.category = category;
      if (query) filter.$text = { $search: query };
      const posts = await BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('author', 'name');
      return response.json({ success: true, data: { posts } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/mine', requireAuth, async (request, response, next) => {
    try {
      const posts = await BlogPost.find({ author: request.user.id }).sort({ updatedAt: -1 });
      return response.json({ success: true, data: { posts } });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', requireAuth, async (request, response, next) => {
    try {
      const input = postSchema.parse(request.body);
      const post = await BlogPost.create({ ...input, author: request.user.id });
      await post.populate('author', 'name');
      return response.status(201).json({ success: true, data: { post } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id', async (request, response, next) => {
    try {
      const post = await BlogPost.findById(request.params.id).populate('author', 'name');
      if (!post) return response.status(404).json({ success: false, error: { message: 'This story could not be found.' } });
      return response.json({ success: true, data: { post } });
    } catch (error) {
      return next(error);
    }
  });

  router.put('/:id', requireAuth, async (request, response, next) => {
    try {
      const input = postSchema.parse(request.body);
      const post = await BlogPost.findOneAndUpdate(
        { _id: request.params.id, author: request.user.id },
        input,
        { new: true, runValidators: true }
      ).populate('author', 'name');
      if (!post) {
        const exists = await BlogPost.exists({ _id: request.params.id });
        return response.status(exists ? 403 : 404).json({
          success: false,
          error: { message: exists ? 'You do not have permission to edit this story.' : 'This story could not be found.' }
        });
      }
      return response.json({ success: true, data: { post } });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', requireAuth, async (request, response, next) => {
    try {
      const post = await BlogPost.findOneAndDelete({ _id: request.params.id, author: request.user.id });
      if (!post) {
        const exists = await BlogPost.exists({ _id: request.params.id });
        return response.status(exists ? 403 : 404).json({
          success: false,
          error: { message: exists ? 'You do not have permission to delete this story.' : 'This story could not be found.' }
        });
      }
      return response.json({ success: true, data: { message: 'Story deleted.' } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/authors/:id', async (request, response, next) => {
    try {
      const user = await User.findById(request.params.id).select('name createdAt');
      if (!user) return response.status(404).json({ success: false, error: { message: 'This profile could not be found.' } });
      const posts = await BlogPost.find({ author: user.id }).sort({ createdAt: -1 }).populate('author', 'name');
      return response.json({ success: true, data: { user, posts } });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
