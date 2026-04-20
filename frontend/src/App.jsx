import { Routes, Route, Link, Navigate } from 'react-router-dom';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';

export default function App() {
  return (
    <>
      <header className="app-header">
        <h1><Link to="/">HMCTS Task Manager</Link></h1>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<TaskListPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
