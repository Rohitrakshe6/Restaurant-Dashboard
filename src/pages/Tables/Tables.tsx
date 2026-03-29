import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { Users, Clock, Plus, Trash2, MoreVertical } from 'lucide-react';
import type { Table as TableType } from '../../types';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const statusConfig = {
  available: {
    badgeBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'AVAILABLE'
  },
  occupied: {
    badgeBg: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'OCCUPIED'
  }
};

const TableCard = ({ table }: { table: TableType }) => {
  const navigate = useNavigate();
  const { setSelectedTable, removeTable, updateTableCapacity } = useRestaurantStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const config = statusConfig[table.status];

  const handleTableClick = () => {
    setSelectedTable(table);
    navigate('/orders');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (table.status !== 'available') {
      toast.error('Cannot remove an occupied table');
      return;
    }
    removeTable(table.id);
    toast.success(`Table ${table.number} removed`);
  };

  const handleChangeSeats = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const newCapacity = window.prompt(`Enter new seat count for Table ${table.number}:`, table.capacity.toString());
    if (newCapacity && !isNaN(Number(newCapacity)) && Number(newCapacity) > 0) {
      updateTableCapacity(table.id, Number(newCapacity));
      toast.success(`Table ${table.number} updated to ${newCapacity} seats`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 20px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)' }}
      whileTap={{ scale: 0.98 }}
      className="relative p-3 rounded-[16px] border border-border bg-card hover:border-primary/30 transition-all cursor-pointer group flex flex-col items-center justify-center h-[110px] overflow-visible shadow-sm"
      onClick={handleTableClick}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="absolute top-2 right-2 z-30">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 rounded-full bg-background/50 backdrop-blur-sm border border-transparent hover:border-border text-muted-foreground hover:bg-muted transition-all shadow-sm opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={14} />
        </motion.button>
        
        <AnimatePresence>
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 top-full mt-1 bg-card border border-border rounded-[12px] shadow-lg shadow-black/5 p-1 min-w-[120px] flex flex-col gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleChangeSeats} 
                className="w-full text-left px-3 py-1.5 text-[12px] font-semibold hover:bg-muted rounded-[8px] text-foreground transition-colors"
              >
                Change Seats
              </button>
              <button 
                onClick={handleRemove} 
                className="w-full text-left px-3 py-1.5 text-[12px] font-semibold hover:bg-red-500/10 text-red-500 rounded-[8px] transition-colors"
              >
                Remove Table
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center justify-center relative z-10 w-full mb-1">
        <h3 className="font-extrabold text-2xl text-foreground tracking-tight">T{table.number}</h3>
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        <Users size={12} />
        <span className="text-[10px] font-semibold">{table.capacity} seats</span>
      </div>

      <span className={clsx("px-3 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider shadow-sm transition-colors", config.badgeBg)}>
        {config.label}
      </span>
    </motion.div>
  );
};

export const Tables: React.FC = () => {
  const { tables, addTable } = useRestaurantStore();

  const handleAddTable = () => {
    addTable();
    toast.success('New table added');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`}></span>
                <span className="text-sm font-semibold text-muted-foreground capitalize">{status}</span>
              </div>
            ))}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTable}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Table</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <AnimatePresence>
          {tables.map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
