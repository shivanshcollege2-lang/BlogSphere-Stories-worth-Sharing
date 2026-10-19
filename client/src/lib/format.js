export function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}

export function excerpt(content = '', length = 150) {
  const text = content.replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
