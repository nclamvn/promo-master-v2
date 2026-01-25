/**
 * Auth Layout - For login, register pages
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">PM</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">PROMO MASTER</h2>
          <p className="mt-1 text-sm text-gray-500">Trade Promotion Management System</p>
        </div>

        {/* Auth form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
