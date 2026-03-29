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
    <header className="h-16 md:h-20 flex items-center justify-between border-b border-border/40 bg-card/50 backdrop-blur-md px-4 md:px-8 z-10 shrink-0 w-full overflow-x-auto hide-scrollbar">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mr-6 md:mr-8 border-r border-border/40 pr-6 md:pr-8 shrink-0">
        <Logo size={36} />
        <div className="flex flex-col">
          <h1 className="font-bold text-[19px] md:text-[21px] tracking-tight text-foreground leading-none">
            Restroo
          </h1>
          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] leading-none mt-2">
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
                'flex items-center gap-2.5 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-300 relative group whitespace-nowrap shrink-0',
                isActive
                  ? 'text-background bg-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className="relative z-10 shrink-0" />
                <span className="font-medium text-[13px] md:text-[14px] relative z-10">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-foreground rounded-full -z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Actions (Right side) */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 border-l border-border/50 pl-4">
          <button 
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors p-2.5 rounded-full hover:bg-muted"
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
            className="text-muted-foreground hover:text-destructive transition-colors p-2.5 rounded-full hover:bg-destructive/10"
            title="Log Out"
          >
            <LogOut className="w-[22px] h-[22px] stroke-[2px]" />
          </button>
      </div>
    </header>
  );
};
