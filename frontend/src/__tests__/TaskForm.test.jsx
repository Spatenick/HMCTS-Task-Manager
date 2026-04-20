import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  test('renders empty form for create mode', () => {
    render(<TaskForm onSubmit={() => {}} />);
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  test('pre-fills form in edit mode', () => {
    const initial = {
      title: 'Existing task',
      description: 'Something',
      status: 'IN_PROGRESS',
      dueDate: '2026-06-15T14:30:00.000Z',
    };
    render(<TaskForm initial={initial} onSubmit={() => {}} />);
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Something');
    expect(screen.getByLabelText(/status/i)).toHaveValue('IN_PROGRESS');
  });

  test('shows validation error when title is missing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/enter a title/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error when due date is missing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'My task');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/enter a due date/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with normalised payload when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), '  Review case  ');
    await user.type(screen.getByLabelText(/description/i), 'Some notes');
    // datetime-local inputs accept raw keyboard typing
    const due = screen.getByLabelText(/due date/i);
    await user.type(due, '2026-12-31T17:00');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe('Review case'); // trimmed
    expect(payload.description).toBe('Some notes');
    expect(payload.status).toBe('PENDING');
    expect(payload.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('surfaces server-side field errors', () => {
    const serverError = {
      message: 'Validation failed',
      details: [{ field: 'title', message: 'Title already taken' }],
    };
    render(<TaskForm onSubmit={() => {}} serverError={serverError} />);
    expect(screen.getByText('Title already taken')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={() => {}} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
