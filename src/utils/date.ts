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

/**
 * Returns true if a deadline timestamp is strictly in the past.
 */
export function isDeadlineOverdue(deadline?: number): boolean {
  if (!deadline) return false;
  return deadline < Date.now();
}

/**
 * Formats a deadline timestamp into a rich, human-readable relative label.
 * e.g., "Overdue by 3 days", "Due in 2 hours", "Due today at 5:00 PM", "Due tomorrow at 9:00 AM"
 */
export function formatDeadlineRelative(deadline?: number): string {
  if (!deadline) return 'No deadline set';

  const now = Date.now();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

  const deadlineDate = new Date(deadline);
  const timeStr = deadlineDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isOverdue) {
    if (minutes < 1) return 'Overdue just now';
    if (minutes < 60) return `Overdue by ${minutes}m`;
    if (hours < 24) return `Overdue by ${hours}h`;
    if (days === 1) return `Overdue by 1 day (${timeStr})`;
    return `Overdue by ${days} days`;
  }

  // Upcoming
  if (minutes < 60) return `Due in ${Math.max(1, minutes)}m (${timeStr})`;
  if (hours < 24) {
    const today = new Date().toDateString();
    if (deadlineDate.toDateString() === today) {
      return `Due today at ${timeStr}`;
    }
    return `Due in ${hours}h (${timeStr})`;
  }
  if (days === 1) return `Due tomorrow at ${timeStr}`;
  if (days < 7) return `Due in ${days} days (${deadlineDate.toLocaleDateString([], { weekday: 'short' })} ${timeStr})`;
  return `Due on ${deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

/**
 * Full formatted deadline: "Oct 15, 2026 at 5:00 PM"
 */
export function formatDeadlineDateTime(deadline?: number): string {
  if (!deadline) return 'No deadline';
  return new Date(deadline).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Converts a Unix epoch timestamp (ms) to string format required by HTML `<input type="datetime-local" />`:
 * "YYYY-MM-DDTHH:mm" in local time zone
 */
export function toDateTimeLocalInputValue(timestamp?: number): string {
  const d = timestamp ? new Date(timestamp) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts "YYYY-MM-DDTHH:mm" back to Unix epoch timestamp (ms)
 */
export function fromDateTimeLocalInputValue(value: string): number {
  if (!value) return Date.now();
  const parsed = new Date(value).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

