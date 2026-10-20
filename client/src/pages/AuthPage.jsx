import { ArrowLeft, BookOpen, Feather, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, messageFromError } from '../lib/api.js';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api(isRegister ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setUser(data.user);
      toast(isRegister ? 'Welcome to BlogSphere. Your writing journey starts here.' : 'Welcome back.');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (submitError) {
      setError(messageFromError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-aside">
        <Link className="back-link" to="/"><ArrowLeft size={15} /> Back to the reading room</Link>
        <div className="auth-aside-copy"><span className="auth-decoration"><BookOpen size={26} /></span><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>There’s a story<br />in <em>everyone.</em></h2><p>Yours deserves a place to be heard.</p></div>
        <span className="auth-aside-foot">BLOGSPHERE · THOUGHTFUL STORIES, SHARED</span>
      </div>
      <div className="auth-main">
        <div className="auth-form-wrap">
          <span className="eyebrow">{isRegister ? 'COME ON IN' : 'GOOD TO SEE YOU'}</span>
          <h1>{isRegister ? 'Make yourself at home.' : 'Welcome back.'}</h1>
          <p className="auth-subtitle">{isRegister ? 'Join a community of curious minds and generous storytellers.' : 'Your reading list and stories are right where you left them.'}</p>
          <form onSubmit={submit} className="auth-form">
            {error && <div className="form-error" role="alert">{error}</div>}
            {isRegister && <label>Your name<span className="input-with-icon"><UserRound size={17} /><input autoComplete="name" minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="How should we call you?" /></span></label>}
            <label>Email address<span className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" maxLength="254" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required placeholder="you@example.com" /></span></label>
            <label>Password<span className="input-with-icon"><LockKeyhole size={17} /><input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 10 : 1} maxLength="72" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required placeholder={isRegister ? 'At least 10 characters' : 'Your password'} /></span></label>
            <button className="button button-primary button-wide" disabled={submitting}>{submitting ? 'One moment…' : isRegister ? <><Feather size={16} /> Create your account</> : 'Sign in to BlogSphere'}</button>
          </form>
          <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to BlogSphere?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
          <p className="auth-terms">{!isRegister && <>For the local demo, sign-in details are in the README’s “Try the local demo” section. </>}By continuing, you agree to keep this a thoughtful, respectful space for everyone.</p>
        </div>
      </div>
    </section>
  );
}
