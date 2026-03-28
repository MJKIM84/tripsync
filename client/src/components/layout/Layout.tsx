import { Link, useLocation } from 'react-router-dom';
import { Compass, Bell, Search, LogOut, Settings, Home, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useState } from 'react';
import NotificationDropdown, { useUnreadCount } from '../NotificationDropdown';
import SearchModal from '../SearchModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const unreadCount = useUnreadCount();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/" className="flex items-center gap-2">
              <Compass className="w-6 h-6 md:w-7 md:h-7 text-navy" />
              <span className="text-lg md:text-xl font-bold text-navy">TripSync</span>
            </Link>

            <div className="flex items-center gap-1.5 md:gap-3">
              <button onClick={() => setShowSearch(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Search className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="w-4 h-4" /> 설정
                      </Link>
                      <button
                        onClick={() => logoutMutation.mutate()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
        <div className="flex items-center justify-around h-14">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/' ? 'text-navy' : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">홈</span>
          </Link>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 relative ${
              showNotifications ? 'text-navy' : 'text-gray-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="text-[10px] font-medium">알림</span>
          </button>
          <Link
            to="/settings"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === '/settings' ? 'text-navy' : 'text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">내 정보</span>
          </Link>
        </div>
      </nav>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
}
