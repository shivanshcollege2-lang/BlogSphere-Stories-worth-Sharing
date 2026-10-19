import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard.jsx';
import { EmptyState, InlineError, Loading } from '../components/States.jsx';
import { api, messageFromError } from '../lib/api.js';

const categories = ['All stories', 'Design', 'Culture', 'Life', 'Technology', 'Ideas'];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All stories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category !== 'All stories') params.set('category', category);
    setLoading(true);
    setError('');
    api(`/posts?${params.toString()}`, { signal: controller.signal })
      .then((data) => setPosts(data.posts))
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError(messageFromError(fetchError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, category, reload]);

  function submitSearch(event) {
    event.preventDefault();
    setSearch(query.trim());
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> A home for curious minds</span>
          <h1>Ideas are better<br />when <em>they’re shared.</em></h1>
          <p>Discover thoughtful stories from people who see the world a little differently.</p>
          <form className="search-form" role="search" onSubmit={submitSearch}>
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="story-search">Search stories</label>
            <input id="story-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, topics, ideas…" />
            <button type="submit">Search</button>
          </form>
          <div className="hero-note"><span className="note-dot" /> Made for good reads and better conversations</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card hero-card-back"><div className="hero-card-line" /><div className="hero-card-line short" /><div className="hero-art-shape" /></div>
          <div className="hero-card hero-card-front"><span className="hero-card-kicker">THE SUNDAY EDIT</span><span className="hero-art-circle" /><span className="hero-card-title">On the art<br />of noticing</span><span className="hero-card-byline">A little more attention. A lot more life.</span></div>
          <span className="hero-spark hero-spark-one">✳</span><span className="hero-spark hero-spark-two">✳</span>
        </div>
      </section>
      <section className="feed-section">
        <div className="section-heading"><div><span className="eyebrow section-eyebrow"><SlidersHorizontal size={13} /> The reading room</span><h2>{search ? `Stories for “${search}”` : 'Fresh perspectives'}</h2></div><span className="story-count">{loading ? ' ' : `${posts.length} ${posts.length === 1 ? 'story' : 'stories'}`}</span></div>
        <div className="category-list" role="group" aria-label="Filter stories by category">
          {categories.map((item) => <button key={item} className={`category-chip ${category === item ? 'active' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        {loading ? <Loading /> : error ? <InlineError message={error} onRetry={() => setReload((value) => value + 1)} /> : posts.length ? (
          <div className="story-grid">{posts.map((post, index) => <BlogCard key={post._id} post={post} index={index} />)}</div>
        ) : (
          <EmptyState title={search || category !== 'All stories' ? 'No stories found' : 'A fresh page awaits'} description={search || category !== 'All stories' ? 'Try a different search or category to find your next good read.' : 'There are no published stories just yet. Be the first to share an idea with the community.'} />
        )}
      </section>
    </>
  );
}
