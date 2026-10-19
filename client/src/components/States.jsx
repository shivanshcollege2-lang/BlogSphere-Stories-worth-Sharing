import { BookOpen, LoaderCircle } from 'lucide-react';

export function Loading({ label = 'Loading stories' }) {
  return <div className="loading-state" role="status"><LoaderCircle className="spin" size={25} /><span>{label}…</span></div>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><BookOpen size={22} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function InlineError({ message, onRetry }) {
  return <div className="inline-error" role="alert"><p>{message}</p>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div>;
}
