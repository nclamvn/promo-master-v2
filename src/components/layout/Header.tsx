import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h2 className="text-sm font-medium text-gray-500">
          Welcome back
        </h2>
        <p className="text-sm font-semibold text-gray-900">
          {user?.name ?? 'User'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <button
            onClick={logout}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
