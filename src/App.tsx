import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Budgets from './pages/Budgets';
import BudgetDetail from './pages/BudgetDetail';
import Promotions from './pages/Promotions';
import PromotionDetail from './pages/PromotionDetail';
import Calendar from './pages/Calendar';
import Targets from './pages/Targets';
import Baselines from './pages/Baselines';
import Analytics from './pages/Analytics';
import WeeklyKpi from './pages/WeeklyKpi';
import Claims from './pages/Claims';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="budgets/:id" element={<BudgetDetail />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="promotions/:id" element={<PromotionDetail />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="targets" element={<Targets />} />
        <Route path="baselines" element={<Baselines />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="analytics/weekly-kpi" element={<WeeklyKpi />} />
        <Route path="claims" element={<Claims />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
