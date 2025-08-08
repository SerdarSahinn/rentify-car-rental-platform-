import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserFormPage from './pages/UserFormPage';
import './App.css';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Debug: Environment variables'ı kontrol et
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log('🔍 CLERK KEY IN APP:', clerkKey);
console.log('🔍 CLERK KEY TYPE:', typeof clerkKey);
console.log('🔍 CLERK KEY LENGTH:', clerkKey?.length);

function App() {
  return (
    <ClerkProvider publishableKey={clerkKey || ''}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/vehicles" element={<VehiclesPage />} />
                  <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
                  <Route path="/vehicles/:id/book" element={<BookingPage />} />
                  <Route path="/payments/:bookingId" element={<PaymentPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/forms/:bookingId" element={<UserFormPage />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
