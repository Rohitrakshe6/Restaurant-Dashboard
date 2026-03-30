import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { useRestaurantStore } from './store/useRestaurantStore';

// Pages
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Tables } from './pages/Tables/Tables';
import { Orders } from './pages/Orders/Orders';
import { Billing } from './pages/Billing/Billing';
import { Reports } from './pages/Reports/Reports';
import { History } from './pages/History/History';
import { Settings } from './pages/Settings/Settings';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-3xl  text-primary bg-card border border-border px-8 py-4 rounded-xl shadow-sm">
      {title} Page Coming Soon
    </h1>
  </div>
);

function App() {
  const { isAuthenticated, theme } = useRestaurantStore();

  // Apply persisted theme on initial mount (survives page refresh)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 12px var(--color-shadow)',
          },
        }} 
      />
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/parcel" element={<Orders />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}

export default App;
