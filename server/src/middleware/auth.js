import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function createAuthMiddleware(jwtSecret) {
  return async function requireAuth(request, response, next) {
    const token = request.cookies?.blogsphere_token;
    if (!token) {
      return response.status(401).json({ success: false, error: { message: 'Please sign in to continue.' } });
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      const user = await User.findById(payload.sub);
      if (!user) {
        return response.status(401).json({ success: false, error: { message: 'Your session is no longer valid.' } });
      }
      request.user = user;
      return next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return response.status(401).json({ success: false, error: { message: 'Your session has expired. Please sign in again.' } });
      }
      return next(error);
    }
  };
}
