import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { Shield, Car, BarChart3, Settings, LogOut, Users, FileText } from 'lucide-react';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Admin kontrolü - sadece admin@rentify.com erişebilir
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses[0]?.emailAddress !== 'admin@rentify.com') {
      navigate('/');
    }
    if (!isSignedIn) {
      navigate('/admin/login');
    }
  }, [isSignedIn, user, navigate]);

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Rezervasyonlar', href: '/admin/bookings', icon: FileText },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Admin Logo */}
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center space-x-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    Rentify Admin
                  </span>
                  <p className="text-xs text-gray-500">Yönetim Paneli</p>
                </div>
              </Link>
            </div>

            {/* Admin Navigation */}
            <nav className="hidden md:flex space-x-4">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Admin User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Admin</span>
                <p className="text-xs text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <SignOutButton redirectUrl="/admin/login">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Warning Banner - Admin özel alanı */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Admin Yönetim Paneli - Sadece Yöneticiler İçin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                Rentify Admin Panel © 2024
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">
                Sistem Durumu: Aktif
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
