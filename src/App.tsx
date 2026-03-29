import React from 'react';
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
  const { isAuthenticated } = useRestaurantStore();

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
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
