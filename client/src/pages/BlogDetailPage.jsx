import { ArrowLeft, ArrowUpRight, Clock3, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InlineError, Loading } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, messageFromError } from '../lib/api.js';
import { formatDate, readingTime } from '../lib/format.js';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api(`/posts/${id}`)
      .then((data) => setPost(data.post))
      .catch((loadError) => setError(messageFromError(loadError)))
      .finally(() => setLoading(false));
  }, [id]);

  async function remove() {
    if (!window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
    try {
      await api(`/posts/${post._id}`, { method: 'DELETE' });
      toast('Your story has been deleted.');
      navigate('/dashboard');
    } catch (deleteError) {
      toast(messageFromError(deleteError), 'error');
    }
  }

  if (loading) return <Loading label="Opening your story" />;
  if (error || !post) return <section className="page-shell"><InlineError message={error || 'This story could not be found.'} /><Link className="text-button" to="/">Explore other stories</Link></section>;
  const owner = user?._id === post.author?._id;

  return (
    <article className="article-shell">
      <div className="article-topline"><Link className="back-link" to="/"><ArrowLeft size={15} /> All stories</Link>{owner && <div className="article-owner-actions"><Link className="button button-quiet" to={`/blogs/${post._id}/edit`}><Pencil size={15} /> Edit story</Link><button className="button button-quiet danger-button" onClick={remove}><Trash2 size={15} /> Delete</button></div>}</div>
      <header className="article-header"><span className="category-label">{post.category}</span><h1>{post.title}</h1><div className="article-byline"><Link className="author-link" to={`/profile/${post.author?._id}`}><span className="avatar">{post.author?.name?.slice(0, 1).toUpperCase() || '?'}</span><span><strong>{post.author?.name || 'BlogSphere writer'}</strong><small>{formatDate(post.createdAt)} <span className="byline-separator">·</span> <Clock3 size={12} /> {readingTime(post.content)} min read</small></span></Link><span className="article-share"><ArrowUpRight size={14} /> A BlogSphere story</span></div></header>
      {post.coverImageUrl && <img className="article-cover" src={post.coverImageUrl} alt="" />}
      <div className="article-content">{post.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      {post.tags.length > 0 && <div className="article-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
      <div className="article-end"><span className="end-flower">✳</span><p>Thanks for reading. Keep wondering.</p><Link to="/">Find another story <ArrowUpRight size={14} /></Link></div>
    </article>
  );
}
