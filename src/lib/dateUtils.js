/**
 * Date and relative timestamp utilities
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function getCurrentMonthName() {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date());
}

export function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthLabel(yearMonthStr) {
  if (!yearMonthStr) return getCurrentMonthName();
  const [year, month] = yearMonthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}

export function getPreviousMonth(yearMonthStr) {
  const [year, month] = (yearMonthStr || getCurrentYearMonth()).split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
}

export function getNextMonth(yearMonthStr) {
  const [year, month] = (yearMonthStr || getCurrentYearMonth()).split('-').map(Number);
  const date = new Date(year, month, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
