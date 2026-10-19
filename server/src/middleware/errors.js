import mongoose from 'mongoose';
import { ZodError } from 'zod';

export function notFound(_request, response) {
  response.status(404).json({ success: false, error: { message: 'The requested resource was not found.' } });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      error: { message: 'Please check the highlighted fields.', details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })) }
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return response.status(400).json({
      success: false,
      error: { message: 'The submitted data is invalid.', details: Object.values(error.errors).map(({ path, message }) => ({ path, message })) }
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ success: false, error: { message: 'The supplied identifier is invalid.' } });
  }

  if (error?.code === 11000) {
    return response.status(409).json({ success: false, error: { message: 'An account with this email already exists.' } });
  }

  console.error(error);
  return response.status(500).json({ success: false, error: { message: 'Something went wrong. Please try again.' } });
}
