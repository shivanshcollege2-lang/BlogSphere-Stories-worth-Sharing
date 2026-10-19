import { ArrowUpRight, CalendarDays, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, InlineError, Loading } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, messageFromError } from '../lib/api.js';
import { excerpt, formatDate } from '../lib/format.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/posts/mine');
      setPosts(data.posts);
      setError('');
    } catch (loadError) {
      setError(messageFromError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function removePost(post) {
    if (!window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
    try {
      await api(`/posts/${post._id}`, { method: 'DELETE' });
      setPosts((current) => current.filter((item) => item._id !== post._id));
      toast('Your story has been deleted.');
    } catch (deleteError) {
      toast(messageFromError(deleteError), 'error');
    }
  }

  return (
    <section className="dashboard page-shell">
      <div className="dashboard-banner"><div><span className="eyebrow">YOUR WRITER’S DESK</span><h1>Good to see you, {user.name.split(' ')[0]}.</h1><p>Your ideas, all in one place. Keep writing, keep wondering.</p></div><Link className="button button-light" to="/create"><FilePlus2 size={17} /> Write a story</Link></div>
      <div className="dashboard-section-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h2>Stories you’ve written</h2></div><span className="story-count">{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span></div>
      {loading ? <Loading label="Gathering your stories" /> : error ? <InlineError message={error} onRetry={load} /> : posts.length ? (
        <div className="dashboard-list">{posts.map((post) => (
          <article className="dashboard-post" key={post._id}>
            <div className="dashboard-post-info"><span className="category-label">{post.category}</span><h3><Link to={`/blogs/${post._id}`}>{post.title}</Link></h3><p>{excerpt(post.content, 120)}</p><span className="dashboard-date"><CalendarDays size={14} /> Last updated {formatDate(post.updatedAt)}</span></div>
            <div className="dashboard-post-actions"><Link className="button button-quiet" to={`/blogs/${post._id}`} aria-label={`View ${post.title}`}>Read <ArrowUpRight size={15} /></Link><Link className="button button-quiet" to={`/blogs/${post._id}/edit`} aria-label={`Edit ${post.title}`}><Pencil size={15} /> Edit</Link><button className="button button-quiet danger-button" onClick={() => removePost(post)} aria-label={`Delete ${post.title}`}><Trash2 size={15} /> Delete</button></div>
          </article>
        ))}</div>
      ) : <EmptyState title="Your first story starts here" description="Put your thoughts into words, and share them with readers who are looking for a fresh perspective." action={<Link className="button button-primary" to="/create"><FilePlus2 size={16} /> Write your first story</Link>} />}
    </section>
  );
}
