const taskModel = require('../models/taskModel');
const { NotFoundError } = require('../utils/errors');

/**
 * Wrap async route handlers so thrown errors propagate to the error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createTask = asyncHandler(async (req, res) => {
  const task = taskModel.create(req.body);
  res.status(201).json(task);
});

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = taskModel.findAll();
  res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = taskModel.findById(req.params.id);
  if (!task) throw new NotFoundError(`Task with id ${req.params.id} not found`);
  res.json(task);
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = taskModel.updateStatus(req.params.id, req.body.status);
  if (!task) throw new NotFoundError(`Task with id ${req.params.id} not found`);
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = taskModel.update(req.params.id, req.body);
  if (!task) throw new NotFoundError(`Task with id ${req.params.id} not found`);
  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const deleted = taskModel.remove(req.params.id);
  if (!deleted) throw new NotFoundError(`Task with id ${req.params.id} not found`);
  res.status(204).send();
});

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
