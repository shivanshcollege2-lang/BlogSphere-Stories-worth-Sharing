import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { excerpt, formatDate, readingTime } from '../lib/format.js';

const colors = ['#dce9e4', '#f0e5d9', '#e4e4f1', '#e9eadb'];

export default function BlogCard({ post, index = 0 }) {
  return (
    <article className="story-card">
      <Link className={`story-art story-art-${index % 4}`} to={`/blogs/${post._id}`} aria-label={`Read ${post.title}`}>
        {post.coverImageUrl ? <img src={post.coverImageUrl} alt="" loading="lazy" /> : (
          <span className="art-placeholder" style={{ '--art-color': colors[index % colors.length] }}>
            <span className="art-orbit" /><span className="art-sun" /><span className="art-caption">{post.category}</span>
          </span>
        )}
        <span className="art-arrow"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="story-meta"><span className="category-label">{post.category}</span><span>{formatDate(post.createdAt)}</span></div>
      <h2 className="story-title"><Link to={`/blogs/${post._id}`}>{post.title}</Link></h2>
      <p className="story-excerpt">{excerpt(post.content, 132)}</p>
      <div className="story-footer">
        <Link className="author-link" to={`/profile/${post.author?._id}`}><span className="avatar avatar-small">{post.author?.name?.slice(0, 1).toUpperCase() || '?'}</span>{post.author?.name || 'BlogSphere writer'}</Link>
        <span className="reading-time"><Clock3 size={13} /> {readingTime(post.content)} min read</span>
      </div>
    </article>
  );
}
