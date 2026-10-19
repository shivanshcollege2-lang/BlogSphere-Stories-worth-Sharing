import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, messageFromError } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const blankPost = { title: '', category: '', content: '', tags: '', coverImageUrl: '' };

export default function BlogForm({ initialPost, postId }) {
  const [form, setForm] = useState(initialPost ? {
    title: initialPost.title,
    category: initialPost.category,
    content: initialPost.content,
    tags: (initialPost.tags || []).join(', '),
    coverImageUrl: initialPost.coverImageUrl || ''
  } : blankPost);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    };
    try {
      const data = await api(postId ? `/posts/${postId}` : '/posts', {
        method: postId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      toast(postId ? 'Your story has been updated.' : 'Your story is now published.');
      navigate(`/blogs/${data.post._id}`);
    } catch (submitError) {
      setError(messageFromError(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={submit}>
      {error && <div className="form-error" role="alert">{error}</div>}
      <label>Story title<input name="title" value={form.title} onChange={update} minLength="5" maxLength="140" placeholder="A title that makes someone pause…" required /></label>
      <div className="form-row">
        <label>Category<input name="category" value={form.category} onChange={update} minLength="2" maxLength="40" placeholder="Design, culture, life…" required /></label>
        <label>Tags <span className="label-optional">comma separated</span><input name="tags" value={form.tags} onChange={update} placeholder="creativity, slow living" /></label>
      </div>
      <label>Cover image URL <span className="label-optional">optional</span><input type="url" name="coverImageUrl" value={form.coverImageUrl} onChange={update} placeholder="https://example.com/image.jpg" /></label>
      <label>Your story<textarea name="content" value={form.content} onChange={update} minLength="50" maxLength="30000" rows="14" placeholder="Begin with the thought you can't stop thinking about…" required /><span className="character-count">{form.content.length.toLocaleString()} / 30,000 characters · minimum 50</span></label>
      <div className="editor-actions"><button className="button button-primary" disabled={saving}>{saving ? 'Saving your story…' : postId ? 'Save changes' : 'Publish story'}</button><button className="button button-quiet" type="button" onClick={() => navigate(-1)} disabled={saving}>Cancel</button></div>
    </form>
  );
}
