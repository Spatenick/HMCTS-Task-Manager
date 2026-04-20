/**
 * Format an ISO date string for display in the UK locale.
 */
export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert an ISO string to the value expected by <input type="datetime-local">.
 * datetime-local wants "YYYY-MM-DDTHH:mm" in *local* time.
 */
export function isoToLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Convert a datetime-local input value (local time) back to ISO/UTC.
 */
export function localInputToIso(local) {
  if (!local) return '';
  const d = new Date(local);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function isOverdue(iso, status) {
  if (!iso) return false;
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  return new Date(iso).getTime() < Date.now();
}
