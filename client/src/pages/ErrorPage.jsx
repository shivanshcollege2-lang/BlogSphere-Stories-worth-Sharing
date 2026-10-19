import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function ErrorPage() {
  const location = useLocation();
  const message = typeof location.state?.message === 'string'
    ? location.state.message
    : 'Something went wrong while opening this page. Please try again.';

  return (
    <section className="not-found page-shell" role="alert">
      <span className="not-found-icon"><AlertTriangle size={26} /></span>
      <span className="eyebrow">A MOMENTARY PAUSE</span>
      <h1>Let’s take<br /><em>another look.</em></h1>
      <p>{message}</p>
      <Link className="button button-primary" to="/"><ArrowLeft size={16} /> Return to the reading room</Link>
    </section>
  );
}
