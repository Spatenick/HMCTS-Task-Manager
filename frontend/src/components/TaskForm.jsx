import { useState } from 'react';
import { STATUSES, STATUS_LABELS } from '../services/tasksApi';
import { isoToLocalInput, localInputToIso } from '../utils/dates';

/**
 * Reusable form for creating or editing a task.
 * Performs client-side validation; server-side errors are surfaced through `serverError`.
 */
export default function TaskForm({ initial = null, onSubmit, onCancel, submitting = false, serverError = null }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState(initial?.status || 'PENDING');
  const [dueDate, setDueDate] = useState(initial?.dueDate ? isoToLocalInput(initial.dueDate) : '');
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!title.trim()) next.title = 'Enter a title';
    else if (title.trim().length > 200) next.title = 'Title must be 200 characters or fewer';
    if (description.length > 2000) next.description = 'Description must be 2000 characters or fewer';
    if (!dueDate) next.dueDate = 'Enter a due date and time';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      status,
      dueDate: localInputToIso(dueDate),
    });
  }

  // Server-returned field-level errors override local ones
  const fieldError = (field) => {
    if (serverError?.details) {
      const hit = serverError.details.find((d) => d.field === field);
      if (hit) return hit.message;
    }
    return errors[field];
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!fieldError('title')}
          aria-describedby={fieldError('title') ? 'title-error' : undefined}
        />
        {fieldError('title') && (
          <p id="title-error" className="field-error">{fieldError('title')}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <span className="hint">Any additional context for this task.</span>
        <textarea
          id="description"
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!fieldError('description')}
        />
        {fieldError('description') && <p className="field-error">{fieldError('description')}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due date and time</label>
        <input
          id="dueDate"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-invalid={!!fieldError('dueDate')}
          aria-describedby={fieldError('dueDate') ? 'dueDate-error' : undefined}
        />
        {fieldError('dueDate') && (
          <p id="dueDate-error" className="field-error">{fieldError('dueDate')}</p>
        )}
      </div>

      <div className="task-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
