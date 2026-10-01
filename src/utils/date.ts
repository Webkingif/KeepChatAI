export function formatWhatsAppTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Same day
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // Within past 6 days
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7 && diffDays > 0) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  // Older
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
}

export function formatFullDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Returns WhatsApp-style date divider label:
 * - "TODAY" for outputs saved today
 * - "YESTERDAY" for outputs saved yesterday
 * - "MONTH DAY, YEAR" (e.g. "OCTOBER 12, 2024") for older dates
 */
export function getWhatsAppDateDivider(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (targetDay === today) {
    return 'TODAY';
  }

  if (targetDay === today - oneDayMs) {
    return 'YESTERDAY';
  }

  return date
    .toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
}
