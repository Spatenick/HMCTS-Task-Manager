import { Link } from 'react-router-dom';
import StatusTag from './StatusTag';
import { STATUSES, STATUS_LABELS } from '../services/tasksApi';
import { formatDateTime, isOverdue } from '../utils/dates';

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <li className="task-card" data-testid={`task-${task.id}`}>
      <h3>
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h3>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span>
          <StatusTag status={task.status} />
        </span>
        <span>
          Due:{' '}
          <span className={overdue ? 'overdue' : ''}>
            {formatDateTime(task.dueDate)}
            {overdue && ' (overdue)'}
          </span>
        </span>
      </div>

      <div className="task-actions">
        <label htmlFor={`status-${task.id}`} className="visually-hidden" style={{ position: 'absolute', left: '-9999px' }}>
          Change status for {task.title}
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary">Edit</Link>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
