import React, { useState } from 'react';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Filter, Download } from 'lucide-react';
import { exportInvoicePDF } from '../../utils/pdfGenerator';
import clsx from 'clsx';
import type { Order } from '../../types';

export const History: React.FC = () => {
  const { orders, menu } = useRestaurantStore();
  const [search, setSearch] = useState('');

  const historyOrders = [...orders]
    .reverse()
    .filter(o => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customerName?.toLowerCase() || '').includes(q) ||
        (o.customerMobile?.toLowerCase() || '').includes(q) ||
        o.type.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
      );
    });

  const calculateTotal = (order: Order) =>
    order.items.reduce((total, item) => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-bold text-2xl text-foreground">Order History</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-sidebar-foreground/70 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-table-header)' }}>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground">Order ID</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date &amp; Time</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Customer</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Mobile No.</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 font-semibold text-[13px] uppercase tracking-wider text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {historyOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <HistoryIcon className="mx-auto mb-4 opacity-50" size={40} />
                    <p className="font-medium text-lg">No orders yet.</p>
                  </td>
                </tr>
              ) : (
                historyOrders.map((order, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors group"
                    style={idx % 2 === 1 ? { backgroundColor: 'var(--color-table-row-alt)' } : {}}
                  >
                    <td className="p-4">
                      <span className="font-extrabold text-[15px] text-foreground">#{order.id}</span>
                    </td>
                    <td className="p-4 font-medium text-muted-foreground text-[14.5px] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-semibold text-foreground text-[14.5px] uppercase tracking-wide">
                      {order.type}
                    </td>
                    <td className="p-4 font-medium text-foreground text-[14.5px] whitespace-nowrap">
                      {order.customerName ? (
                        <span className="font-semibold">{order.customerName}</span>
                      ) : (
                        <span className="opacity-50 italic text-muted-foreground">Walk-in</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-muted-foreground text-[14.5px] whitespace-nowrap">
                      {order.customerMobile ? (
                        <span>{order.customerMobile}</span>
                      ) : (
                        <span className="opacity-40">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide border',
                        order.status === 'completed' && 'border-emerald-200',
                        order.status === 'active'    && 'border-amber-200',
                        order.status === 'billing'   && 'border-amber-200',
                        order.status === 'cancelled' && 'border-red-200',
                      )}
                      style={{
                        ...(order.status === 'completed' && { backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }),
                        ...(order.status === 'active'    && { backgroundColor: '#FEF3C7', color: 'var(--color-warning)' }),
                        ...(order.status === 'billing'   && { backgroundColor: '#FEF3C7', color: 'var(--color-warning)' }),
                        ...(order.status === 'cancelled' && { backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }),
                      }}
                      >
                        {order.status === 'active' ? 'RUNNING' : order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-black text-foreground text-[15px] text-right group-hover:text-primary transition-colors">
                      <div className="flex items-center justify-end gap-3">
                        <span>₹{(order.totalAmount || calculateTotal(order)).toFixed(2)}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            exportInvoicePDF(order, menu, [], order.customerName);
                          }}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-[0.98]"
                          title="Download PDF Invoice"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
