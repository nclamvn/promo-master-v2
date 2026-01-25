/**
 * React Router Configuration
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Auth guard
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Loading fallback
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

const PromotionList = lazy(() => import('@/pages/promotions/PromotionList'));
const PromotionDetail = lazy(() => import('@/pages/promotions/PromotionDetail'));
const PromotionNew = lazy(() => import('@/pages/promotions/PromotionNew'));
const PromotionEdit = lazy(() => import('@/pages/promotions/PromotionEdit'));

const ClaimList = lazy(() => import('@/pages/claims/ClaimList'));
const ClaimDetail = lazy(() => import('@/pages/claims/ClaimDetail'));
const ClaimNew = lazy(() => import('@/pages/claims/ClaimNew'));

const FundList = lazy(() => import('@/pages/funds/FundList'));
const FundDetail = lazy(() => import('@/pages/funds/FundDetail'));
const FundNew = lazy(() => import('@/pages/funds/FundNew'));
const FundEdit = lazy(() => import('@/pages/funds/FundEdit'));

const CustomerList = lazy(() => import('@/pages/customers/CustomerList'));
const CustomerDetail = lazy(() => import('@/pages/customers/CustomerDetail'));

const ProductList = lazy(() => import('@/pages/products/ProductList'));
const ProductDetail = lazy(() => import('@/pages/products/ProductDetail'));

const ReportList = lazy(() => import('@/pages/reports/ReportList'));
const WeeklyKPI = lazy(() => import('@/pages/reports/WeeklyKPI'));
const Settings = lazy(() => import('@/pages/settings/Settings'));

// New pages
const Analytics = lazy(() => import('@/pages/analytics/Analytics'));
const BudgetList = lazy(() => import('@/pages/budgets/BudgetList'));
const BudgetNew = lazy(() => import('@/pages/budgets/BudgetNew'));
const CalendarView = lazy(() => import('@/pages/calendar/CalendarView'));
const TargetList = lazy(() => import('@/pages/targets/TargetList'));
const TargetNew = lazy(() => import('@/pages/targets/TargetNew'));
const BaselineList = lazy(() => import('@/pages/baselines/BaselineList'));
const BaselineNew = lazy(() => import('@/pages/baselines/BaselineNew'));

// Finance pages
const AccrualList = lazy(() => import('@/pages/finance/accruals/AccrualList'));
const AccrualDetail = lazy(() => import('@/pages/finance/accruals/AccrualDetail'));
const AccrualCalculate = lazy(() => import('@/pages/finance/accruals/AccrualCalculate'));

const NotFound = lazy(() => import('@/pages/errors/NotFound'));

// Suspense wrapper
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    {children}
  </Suspense>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes - Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <SuspenseWrapper><Login /></SuspenseWrapper>
        } />
        <Route path="/register" element={
          <SuspenseWrapper><Register /></SuspenseWrapper>
        } />
        <Route path="/forgot-password" element={
          <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>
        } />
      </Route>

      {/* Protected routes - Dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <SuspenseWrapper><Dashboard /></SuspenseWrapper>
        } />

        {/* Promotions */}
        <Route path="/promotions" element={
          <SuspenseWrapper><PromotionList /></SuspenseWrapper>
        } />
        <Route path="/promotions/new" element={
          <SuspenseWrapper><PromotionNew /></SuspenseWrapper>
        } />
        <Route path="/promotions/:id" element={
          <SuspenseWrapper><PromotionDetail /></SuspenseWrapper>
        } />
        <Route path="/promotions/:id/edit" element={
          <SuspenseWrapper><PromotionEdit /></SuspenseWrapper>
        } />

        {/* Claims */}
        <Route path="/claims" element={
          <SuspenseWrapper><ClaimList /></SuspenseWrapper>
        } />
        <Route path="/claims/new" element={
          <SuspenseWrapper><ClaimNew /></SuspenseWrapper>
        } />
        <Route path="/claims/:id" element={
          <SuspenseWrapper><ClaimDetail /></SuspenseWrapper>
        } />

        {/* Funds */}
        <Route path="/funds" element={
          <SuspenseWrapper><FundList /></SuspenseWrapper>
        } />
        <Route path="/funds/new" element={
          <SuspenseWrapper><FundNew /></SuspenseWrapper>
        } />
        <Route path="/funds/:id" element={
          <SuspenseWrapper><FundDetail /></SuspenseWrapper>
        } />
        <Route path="/funds/:id/edit" element={
          <SuspenseWrapper><FundEdit /></SuspenseWrapper>
        } />

        {/* Customers */}
        <Route path="/customers" element={
          <SuspenseWrapper><CustomerList /></SuspenseWrapper>
        } />
        <Route path="/customers/:id" element={
          <SuspenseWrapper><CustomerDetail /></SuspenseWrapper>
        } />

        {/* Products */}
        <Route path="/products" element={
          <SuspenseWrapper><ProductList /></SuspenseWrapper>
        } />
        <Route path="/products/:id" element={
          <SuspenseWrapper><ProductDetail /></SuspenseWrapper>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <SuspenseWrapper><ReportList /></SuspenseWrapper>
        } />
        <Route path="/weekly-kpi" element={
          <SuspenseWrapper><WeeklyKPI /></SuspenseWrapper>
        } />

        {/* Analytics */}
        <Route path="/analytics" element={
          <SuspenseWrapper><Analytics /></SuspenseWrapper>
        } />

        {/* Calendar */}
        <Route path="/calendar" element={
          <SuspenseWrapper><CalendarView /></SuspenseWrapper>
        } />

        {/* Budgets */}
        <Route path="/budgets" element={
          <SuspenseWrapper><BudgetList /></SuspenseWrapper>
        } />
        <Route path="/budgets/new" element={
          <SuspenseWrapper><BudgetNew /></SuspenseWrapper>
        } />

        {/* Targets */}
        <Route path="/targets" element={
          <SuspenseWrapper><TargetList /></SuspenseWrapper>
        } />
        <Route path="/targets/new" element={
          <SuspenseWrapper><TargetNew /></SuspenseWrapper>
        } />

        {/* Baselines */}
        <Route path="/baselines" element={
          <SuspenseWrapper><BaselineList /></SuspenseWrapper>
        } />
        <Route path="/baselines/new" element={
          <SuspenseWrapper><BaselineNew /></SuspenseWrapper>
        } />

        {/* Finance - Accruals */}
        <Route path="/finance/accruals" element={
          <SuspenseWrapper><AccrualList /></SuspenseWrapper>
        } />
        <Route path="/finance/accruals/calculate" element={
          <SuspenseWrapper><AccrualCalculate /></SuspenseWrapper>
        } />
        <Route path="/finance/accruals/:id" element={
          <SuspenseWrapper><AccrualDetail /></SuspenseWrapper>
        } />

        {/* Settings */}
        <Route path="/settings" element={
          <SuspenseWrapper><Settings /></SuspenseWrapper>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <SuspenseWrapper><NotFound /></SuspenseWrapper>
      } />
    </Routes>
  );
}
