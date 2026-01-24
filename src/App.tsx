import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="budgets" element={<PlaceholderPage title="Budgets" />} />
        <Route path="promotions" element={<PlaceholderPage title="Promotions" />} />
        <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route path="claims" element={<PlaceholderPage title="Claims" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">This page is under development.</p>
    </div>
  );
}

export default App;
