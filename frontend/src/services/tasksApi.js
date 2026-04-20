import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Normalise errors from the API into a message + optional field details.
 */
function extractError(err) {
  if (err.response?.data) {
    return {
      message: err.response.data.error || 'Request failed',
      details: err.response.data.details || null,
      status: err.response.status,
    };
  }
  return { message: err.message || 'Network error', details: null, status: 0 };
}

export const tasksApi = {
  async list() {
    try {
      const res = await client.get('/tasks');
      return res.data;
    } catch (err) { throw extractError(err); }
  },
  async get(id) {
    try {
      const res = await client.get(`/tasks/${id}`);
      return res.data;
    } catch (err) { throw extractError(err); }
  },
  async create(task) {
    try {
      const res = await client.post('/tasks', task);
      return res.data;
    } catch (err) { throw extractError(err); }
  },
  async update(id, task) {
    try {
      const res = await client.put(`/tasks/${id}`, task);
      return res.data;
    } catch (err) { throw extractError(err); }
  },
  async updateStatus(id, status) {
    try {
      const res = await client.patch(`/tasks/${id}/status`, { status });
      return res.data;
    } catch (err) { throw extractError(err); }
  },
  async remove(id) {
    try {
      await client.delete(`/tasks/${id}`);
    } catch (err) { throw extractError(err); }
  },
};

export const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
