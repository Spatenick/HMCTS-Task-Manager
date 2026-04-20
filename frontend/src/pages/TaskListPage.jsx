import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import Banner from '../components/Banner';
import { tasksApi, STATUSES, STATUS_LABELS } from '../services/tasksApi';

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('ALL');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    try {
      const updated = await tasksApi.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSuccess(`Status updated to "${STATUS_LABELS[status]}"`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const task = tasks.find((t) => t.id === id);
    if (!window.confirm(`Delete task "${task?.title}"? This cannot be undone.`)) return;
    try {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSuccess('Task deleted');
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleTasks = useMemo(() => {
    if (filter === 'ALL') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  return (
    <div>
      <div className="page-header">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary">+ New task</Link>
      </div>

      {error && <Banner type="error">{error}</Banner>}
      {success && <Banner type="success">{success}</Banner>}

      <div className="filter-bar">
        <label htmlFor="filter">Filter by status:</label>
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span aria-live="polite">
          {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {loading ? (
        <p className="loading">Loading tasks…</p>
      ) : visibleTasks.length === 0 ? (
        <div className="empty-state">
          <p>{filter === 'ALL' ? 'No tasks yet.' : 'No tasks match this filter.'}</p>
          {filter === 'ALL' && <Link to="/tasks/new" className="btn btn-primary">Create your first task</Link>}
        </div>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
