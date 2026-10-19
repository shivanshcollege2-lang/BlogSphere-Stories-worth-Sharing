import { ArrowLeft, Feather } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BlogForm from '../components/BlogForm.jsx';
import { InlineError, Loading } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, messageFromError } from '../lib/api.js';

export default function BlogEditorPage({ edit = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!edit) return;
    api(`/posts/${id}`)
      .then(({ post: found }) => {
        if (found.author?._id !== user._id) setError('You can only edit stories you have written.');
        else setPost(found);
      })
      .catch((loadError) => setError(messageFromError(loadError)))
      .finally(() => setLoading(false));
  }, [edit, id, user._id]);

  if (loading) return <Loading label="Opening the editor" />;
  if (error) return <section className="page-shell editor-shell"><InlineError message={error} /><Link className="text-button" to="/dashboard">Return to your stories</Link></section>;

  return (
    <section className="editor-shell page-shell">
      <Link className="back-link" to={edit ? '/dashboard' : '/'}><ArrowLeft size={15} /> {edit ? 'Back to your stories' : 'Back to reading'}</Link>
      <div className="editor-intro"><span className="editor-mark"><Feather size={20} /></span><span className="eyebrow">{edit ? 'REFINE YOUR WORDS' : 'MAKE SOMETHING THAT MATTERS'}</span><h1>{edit ? 'A story, in progress.' : 'What’s on your mind?'}</h1><p>{edit ? 'A few thoughtful edits can make your story sing.' : 'Write honestly. Someone out there needs to hear it.'}</p></div>
      <BlogForm initialPost={post} postId={edit ? id : undefined} />
    </section>
  );
}
