import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Package, 
  Receipt, BarChart3, History, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useRestaurantStore } from '../../store/useRestaurantStore';
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

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useRestaurantStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
      className="bg-[#0F111A] text-white h-screen flex flex-col sticky top-0 border-r border-[#0F111A] shadow-2xl z-20"
    >
      <div className="p-4 flex items-center justify-between">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
          >
            <Logo size={32} />
            <h1 className=" font-bold text-[18px] tracking-wide text-white">
              Restroo
            </h1>
          </motion.div>
        )}
        {sidebarCollapsed && (
          <div className="w-full flex items-center justify-center">
            <Logo size={32} />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group font-medium text-[15px]',
                isActive
                  ? 'font-semibold'
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-100'
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    backgroundColor: '#D1FAE5',
                    borderLeft: '3px solid #059669',
                    color: '#059669',
                    boxShadow: '0 1px 4px rgba(5,150,105,0.15)',
                    paddingLeft: 'calc(0.75rem - 3px)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={sidebarCollapsed ? 24 : 20}
                  className="shrink-0"
                  style={{ color: isActive ? '#059669' : undefined }}
                />
                {!sidebarCollapsed && (
                  <span
                    className="whitespace-nowrap"
                    style={{ color: isActive ? '#059669' : undefined }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="p-4 flex items-center justify-center border-t border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
      >
        {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </motion.aside>
  );
};
