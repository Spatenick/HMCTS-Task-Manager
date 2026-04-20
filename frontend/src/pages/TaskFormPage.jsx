import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import Banner from '../components/Banner';
import { tasksApi } from '../services/tasksApi';

export default function TaskFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setInitial(await tasksApi.get(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setError(null);
    try {
      const saved = isEdit ? await tasksApi.update(id, data) : await tasksApi.create(data);
      navigate(`/tasks/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  if (loading) return <p className="loading">Loading task…</p>;

  return (
    <div>
      <Link to={isEdit ? `/tasks/${id}` : '/'} className="back-link">
        ← {isEdit ? 'Back to task' : 'Back to all tasks'}
      </Link>
      <h1>{isEdit ? 'Edit task' : 'Create a new task'}</h1>

      {error && <Banner type="error">{error.message || 'Something went wrong'}</Banner>}

      <TaskForm
        initial={initial}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `/tasks/${id}` : '/')}
        submitting={submitting}
        serverError={error}
      />
    </div>
  );
}
