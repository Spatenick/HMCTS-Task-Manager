import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import StatusTag from '../components/StatusTag';
import Banner from '../components/Banner';
import { tasksApi } from '../services/tasksApi';
import { formatDateTime, isOverdue } from '../utils/dates';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setTask(await tasksApi.get(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await tasksApi.remove(id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="loading">Loading task…</p>;
  if (error) return (
    <>
      <Link to="/" className="back-link">← Back to all tasks</Link>
      <Banner type="error">{error}</Banner>
    </>
  );
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div>
      <Link to="/" className="back-link">← Back to all tasks</Link>
      <div className="page-header">
        <h1>{task.title}</h1>
        <StatusTag status={task.status} />
      </div>

      <dl className="details-list">
        <dt>Description</dt>
        <dd>{task.description || <em>None</em>}</dd>

        <dt>Status</dt>
        <dd><StatusTag status={task.status} /></dd>

        <dt>Due date</dt>
        <dd className={overdue ? 'overdue' : ''}>
          {formatDateTime(task.dueDate)}
          {overdue && ' (overdue)'}
        </dd>

        <dt>Created</dt>
        <dd>{formatDateTime(task.createdAt)}</dd>

        <dt>Last updated</dt>
        <dd>{formatDateTime(task.updatedAt)}</dd>
      </dl>

      <div className="task-actions">
        <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary">Edit</Link>
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
