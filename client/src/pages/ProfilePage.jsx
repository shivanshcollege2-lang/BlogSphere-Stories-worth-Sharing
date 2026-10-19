import { CalendarDays, Feather } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogCard from '../components/BlogCard.jsx';
import { EmptyState, InlineError, Loading } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, messageFromError } from '../lib/api.js';
import { formatDate } from '../lib/format.js';

export default function ProfilePage({ own = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const profileId = own ? user?._id : id;

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    api(`/posts/authors/${profileId}`)
      .then((data) => { setProfile(data.user); setPosts(data.posts); })
      .catch((loadError) => setError(messageFromError(loadError)))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <Loading label="Finding the author" />;
  if (error) return <section className="page-shell"><InlineError message={error} /><Link className="text-button" to="/">Return to the reading room</Link></section>;

  return (
    <section className="page-shell profile-page">
      <div className="profile-header"><span className="profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><div className="profile-details"><span className="eyebrow">{own ? 'YOUR PROFILE' : 'MEET THE WRITER'}</span><h1>{profile.name}</h1><p><CalendarDays size={15} /> Writing on BlogSphere since {formatDate(profile.createdAt)}</p></div>{own && <Link className="button button-primary" to="/create"><Feather size={16} /> Write a story</Link>}</div>
      <div className="dashboard-section-heading"><div><span className="eyebrow">PUBLISHED WORK</span><h2>{own ? 'Your stories' : `Stories by ${profile.name.split(' ')[0]}`}</h2></div><span className="story-count">{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span></div>
      {posts.length ? <div className="story-grid">{posts.map((post, index) => <BlogCard key={post._id} post={post} index={index} />)}</div> : <EmptyState title="No stories just yet" description={own ? 'Your published stories will find a home here.' : 'This writer has not published a story yet.'} />}
    </section>
  );
}
