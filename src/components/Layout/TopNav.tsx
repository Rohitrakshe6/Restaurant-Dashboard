import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, UtensilsCrossed, ShoppingBag, 
  Receipt, BarChart3, History, Settings
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tables', label: 'Tables', icon: UtensilsCrossed },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/billing', label: 'Billing', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const TopNav: React.FC = () => {
  return (
    <nav className="w-full bg-card border-b border-border/40 px-4 flex items-center gap-1 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none' }}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2 px-4 py-4 transition-all duration-300 relative group whitespace-nowrap',
              isActive
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeTopNav"
                  className="absolute bottom-[0px] left-0 right-0 h-[3px] bg-primary rounded-t-sm"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="relative z-10 shrink-0" />
              <span className="font-medium text-[14px] relative z-10">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
