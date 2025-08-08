import { useState, useEffect } from 'react';
import { useSignIn, useUser, SignOutButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Eye, EyeOff, LogOut } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, isLoaded } = useSignIn();
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Eğer zaten giriş yapmışsa ve admin ise direkt yönlendir
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses[0]?.emailAddress === 'admin@rentify.com') {
      navigate('/admin');
    }
  }, [isSignedIn, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Admin kontrolü yap
        const user = result.createdSessionId ? await signIn.user : null;
        
        if (user?.emailAddresses[0]?.emailAddress === 'admin@rentify.com') {
          navigate('/admin');
        } else {
          setError('Bu giriş sadece admin kullanıcıları içindir.');
          await signIn.signOut();
        }
      } else {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Giriş hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Girişi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rentify yönetim paneline erişim
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email adresi"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Girişi
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500 block"
            >
              ← Ana sayfaya dön
            </a>
            {isSignedIn && (
              <SignOutButton>
                <button className="text-sm text-red-600 hover:text-red-500 flex items-center justify-center mx-auto">
                  <LogOut className="h-4 w-4 mr-1" />
                  Çıkış Yap
                </button>
              </SignOutButton>
            )}
          </div>
        </form>

        {/* Admin Bilgileri */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Admin Giriş Bilgileri:
          </h3>
          <div className="text-sm text-blue-700">
                         <p><strong>Email:</strong> admin@rentify.com</p>
             <p><strong>Şifre:</strong> Rentify2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
