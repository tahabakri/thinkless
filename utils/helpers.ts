export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHrs < 24) return `${diffHrs}H AGO`;
  if (diffDays < 7) return `${diffDays}D AGO`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export function formatDeadline(ts: number): string {
  const now = Date.now();
  const diffMs = ts - now;
  if (diffMs <= 0) return 'OVERDUE';
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 24) return `${diffHrs}H LEFT`;
  const diffDays = Math.floor(diffMs / 86400000);
  return `${diffDays}D LEFT`;
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'ESCAPED';
  if (score >= 60) return 'BREAKING FREE';
  if (score >= 40) return 'STUCK';
  if (score >= 20) return 'SPIRALING';
  return 'TRAPPED';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#CDFF00';
  if (score >= 60) return '#88CC00';
  if (score >= 40) return '#FF9500';
  if (score >= 20) return '#FF6B00';
  return '#FF3B30';
}
