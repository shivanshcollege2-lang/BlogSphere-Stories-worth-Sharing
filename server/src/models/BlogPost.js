import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 140
  },
  content: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 30000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 40
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (tags) => tags.length <= 8 && tags.every((tag) => tag.length <= 24),
      message: 'Use up to 8 tags, each no longer than 24 characters.'
    }
  },
  coverImageUrl: {
    type: String,
    trim: true,
    default: '',
    maxlength: 2048,
    match: [/^$|^https?:\/\//i, 'Cover image URL must use HTTP or HTTPS.']
  }
}, { timestamps: true });

blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
