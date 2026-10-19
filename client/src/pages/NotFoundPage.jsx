import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <section className="not-found page-shell"><span className="not-found-icon"><Compass size={28} /></span><span className="eyebrow">A LITTLE OFF THE MAP</span><h1>This page took<br /><em>a different turn.</em></h1><p>The story you’re looking for may have moved, or perhaps it hasn’t been written yet.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} /> Return to the reading room</Link></section>;
}
