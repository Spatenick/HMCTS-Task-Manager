import { STATUS_LABELS } from '../services/tasksApi';

export default function StatusTag({ status }) {
  return (
    <span className={`tag tag-${status}`} data-testid="status-tag">
      {STATUS_LABELS[status] || status}
    </span>
  );
}
