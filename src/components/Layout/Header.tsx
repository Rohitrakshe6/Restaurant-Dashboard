import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Moon, Sun, LayoutDashboard, UtensilsCrossed, 
  ShoppingBag, Receipt, BarChart3, History, 
  Settings, LogOut 
} from 'lucide-react';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Logo } from '../Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tables', label: 'Tables', icon: UtensilsCrossed },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/billing', label: 'Billing', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme, logout } = useRestaurantStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="h-16 md:h-20 flex items-center justify-between border-b border-border bg-card px-4 md:px-8 z-10 shrink-0 w-full overflow-x-auto hide-scrollbar shadow-sm">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mr-6 md:mr-8 border-r border-border pr-6 md:pr-8 shrink-0">
        <Logo size={36} />
        <div className="flex flex-col">
          <h1 className="font-bold text-[19px] md:text-[21px] tracking-tight leading-none" style={{ color: 'var(--color-text-primary)' }}>
            Restroo
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] leading-none mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            BY ARCHARC
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex items-center gap-1 md:gap-2 mr-4 min-w-max">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 md:px-4 md:py-2.5 transition-all duration-200 relative group whitespace-nowrap shrink-0 text-[13px] md:text-[14px]',
                isActive
                  ? 'font-semibold'
                  : 'font-medium hover:bg-muted/60 rounded-xl'
              )
            }
            style={({ isActive }) =>
              isActive
                ? theme === 'dark'
                  ? {
                      backgroundColor: '#FFFFFF',
                      borderRight: '3px solid #059669',
                      borderRadius: '12px',
                      color: '#059669',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.12)',
                      paddingRight: 'calc(1rem - 3px)',
                    }
                  : {
                      backgroundColor: '#D1FAE5',
                      borderRight: '3px solid #059669',
                      borderRadius: '12px',
                      color: '#047857',
                      boxShadow: '0 2px 10px rgba(5,150,105,0.22)',
                      paddingRight: 'calc(1rem - 3px)',
                    }
                : {
                    color: theme === 'dark' ? '#9CA3AF' : '#374151',
                  }
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className="shrink-0"
                  style={{ color: isActive ? '#059669' : undefined }}
                />
                <span style={{ color: isActive ? '#059669' : undefined }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Actions (Right side) */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 border-l border-border pl-4">
          <button 
            onClick={toggleTheme}
            className="transition-colors p-2.5 rounded-full hover:bg-muted"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-[22px] h-[22px] stroke-[2px]" />
            ) : (
              <Sun className="w-[22px] h-[22px] stroke-[2px]" />
            )}
          </button>

          <button 
            onClick={handleLogout}
            className="transition-colors p-2.5 rounded-full hover:bg-red-50"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            title="Log Out"
          >
            <LogOut className="w-[22px] h-[22px] stroke-[2px]" />
          </button>
      </div>
    </header>
  );
};
