import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TaskListPage from '../pages/TaskListPage';
import { tasksApi } from '../services/tasksApi';

vi.mock('../services/tasksApi', async () => {
  const actual = await vi.importActual('../services/tasksApi');
  return {
    ...actual,
    tasksApi: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      remove: vi.fn(),
    },
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <TaskListPage />
    </MemoryRouter>
  );
}

const sampleTasks = [
  {
    id: 't1',
    title: 'First task',
    description: 'Do the thing',
    status: 'PENDING',
    dueDate: '2099-12-31T17:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 't2',
    title: 'Second task',
    description: null,
    status: 'COMPLETED',
    dueDate: '2099-12-31T17:00:00.000Z',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading then renders tasks', async () => {
    tasksApi.list.mockResolvedValue(sampleTasks);
    renderPage();

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('First task')).toBeInTheDocument();
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    tasksApi.list.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  test('shows error banner when list fails', async () => {
    tasksApi.list.mockRejectedValue({ message: 'Network down' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Network down')).toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
    const user = userEvent.setup();
    tasksApi.list.mockResolvedValue(sampleTasks);
    renderPage();

    await waitFor(() => screen.getByText('First task'));
    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'COMPLETED');

    expect(screen.queryByText('First task')).not.toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });

  test('updates status when dropdown changes', async () => {
    const user = userEvent.setup();
    tasksApi.list.mockResolvedValue(sampleTasks);
    tasksApi.updateStatus.mockResolvedValue({ ...sampleTasks[0], status: 'IN_PROGRESS' });
    renderPage();

    await waitFor(() => screen.getByText('First task'));
    const select = screen.getByLabelText(/change status for first task/i);
    await user.selectOptions(select, 'IN_PROGRESS');

    await waitFor(() => {
      expect(tasksApi.updateStatus).toHaveBeenCalledWith('t1', 'IN_PROGRESS');
    });
  });

  test('deletes a task after confirmation', async () => {
    const user = userEvent.setup();
    tasksApi.list.mockResolvedValue(sampleTasks);
    tasksApi.remove.mockResolvedValue();
    window.confirm = vi.fn(() => true);

    renderPage();
    await waitFor(() => screen.getByText('First task'));

    const firstCard = screen.getByTestId('task-t1');
    const deleteBtn = firstCard.querySelector('.btn-danger');
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(tasksApi.remove).toHaveBeenCalledWith('t1');
      expect(screen.queryByText('First task')).not.toBeInTheDocument();
    });
  });

  test('does not delete when user cancels the confirmation', async () => {
    const user = userEvent.setup();
    tasksApi.list.mockResolvedValue(sampleTasks);
    tasksApi.remove.mockResolvedValue();
    window.confirm = vi.fn(() => false);

    renderPage();
    await waitFor(() => screen.getByText('First task'));

    const firstCard = screen.getByTestId('task-t1');
    const deleteBtn = firstCard.querySelector('.btn-danger');
    await user.click(deleteBtn);

    expect(tasksApi.remove).not.toHaveBeenCalled();
    expect(screen.getByText('First task')).toBeInTheDocument();
  });
});
