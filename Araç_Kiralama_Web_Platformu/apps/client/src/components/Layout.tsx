import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Car, Home, User, Menu, X, Sparkles, Shield, Clock, Star } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isSignedIn } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Araçlar', href: '/vehicles', icon: Car },
    ...(isSignedIn ? [{ name: 'Profil', href: '/profile', icon: User }] : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <Car className="h-10 w-10 text-white relative z-10 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Rentify
                  </span>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500 font-medium">Premium Araç Kiralama</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50 hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-300">
                      Giriş Yap
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      Kayıt Ol
                    </button>
                  </SignUpButton>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white/50 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-sm"></div>
                  <Car className="h-8 w-8 text-white relative z-10 p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Rentify
                  </span>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500 font-medium">Premium Araç Kiralama</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Türkiye'nin en güvenilir ve premium araç kiralama platformu. 
                Lüks araçlardan ekonomik modellere kadar geniş filomuzla hizmetinizdeyiz.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Güvenli Ödeme</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">7/24 Destek</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Premium Hizmet</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Hızlı Linkler
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link to="/vehicles" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    Araçlar
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    Profil
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                İletişim
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Email:</span><br />
                  info@rentify.com
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Tel:</span><br />
                  +90 212 123 45 67
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Adres:</span><br />
                  İstanbul, Türkiye
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Rentify. Tüm hakları saklıdır. Premium araç kiralama deneyimi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 