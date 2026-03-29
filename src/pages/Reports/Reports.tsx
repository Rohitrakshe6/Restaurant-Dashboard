import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import { exportSalesReportPDF } from '../../utils/pdfGenerator';
import { exportSalesReportCSV } from '../../utils/reportGenerator';
import clsx from 'clsx';

// ─── Date helpers ─────────────────────────────────────────────────────────────
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOf   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

type FilterMode = 'all' | 'today' | 'week' | 'month' | 'custom';

interface Range {
  from: Date | null;
  to:   Date | null;
  label: string;
}

const getRange = (mode: FilterMode, customFrom: string, customTo: string): Range => {
  const now = new Date();
  if (mode === 'today') {
    return {
      from: startOf(now), to: endOf(now),
      label: `Daily – ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    };
  }
  if (mode === 'week') {
    const from = new Date(now); from.setDate(now.getDate() - 6);
    return {
      from: startOf(from), to: endOf(now),
      label: `Weekly – ${from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} to ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    };
  }
  if (mode === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: startOf(from), to: endOf(now),
      label: `Monthly – ${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
    };
  }
  if (mode === 'custom' && customFrom && customTo) {
    const from = new Date(customFrom);
    const to   = new Date(customTo);
    return {
      from: startOf(from), to: endOf(to),
      label: `${from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} → ${to.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    };
  }
  return { from: null, to: null, label: 'All Time' };
};

const modeLabels: Record<FilterMode, string> = {
  all:    'All Time',
  today:  'Today',
  week:   'This Week',
  month:  'This Month',
  custom: 'Custom Range',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Reports: React.FC = () => {
  const { orders, menu } = useRestaurantStore();

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { filteredOrders, range } = useMemo(() => {
    const range = getRange(filterMode, customFrom, customTo);

    let result = [...orders];
    if (range.from && range.to) {
      result = result.filter(o => {
        const d = new Date(o.createdAt);
        return d >= range.from! && d <= range.to!;
      });
    }
    return { filteredOrders: result, range };
  }, [orders, filterMode, customFrom, customTo]);

  const handlePDF = () => {
    if (filteredOrders.length === 0) return;
    exportSalesReportPDF({
      orders: filteredOrders,
      menu,
      label:    range.label,
      dateFrom: range.from ? range.from.toLocaleDateString('en-IN') : undefined,
      dateTo:   range.to   ? range.to.toLocaleDateString('en-IN')   : undefined,
    });
  };

  const handleCSV = () => {
    if (filteredOrders.length === 0) return;
    exportSalesReportCSV({ orders: filteredOrders, menu, label: range.label });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-12">

      {/* ── Header ── */}
      <div>
        <h2 className="font-bold text-2xl text-foreground">Export Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Filter by period, preview the summary, then download as PDF or CSV.
        </p>
      </div>

      {/* ── Period Filter ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Period</p>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(modeLabels) as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                filterMode === mode
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              )}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>

        {/* Custom range picker */}
        <AnimatePresence>
          {filterMode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Calendar size={16} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">From</span>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || today}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm font-medium text-muted-foreground">To</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={today}
                  onChange={e => setCustomTo(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {(customFrom || customTo) && (
                  <button
                    onClick={() => { setCustomFrom(''); setCustomTo(''); }}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active period label */}
        <p className="text-xs text-muted-foreground">
          Showing: <span className="font-semibold text-foreground">{range.label}</span>
          {' · '}<span className="font-semibold text-foreground">{filteredOrders.length} orders</span>
        </p>
      </div>


      {/* ── Download Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* CSV Card */}
        <motion.div
          whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgba(0,0,0,0.12)' }}
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group"
        >
          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileSpreadsheet size={32} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-foreground tracking-tight">CSV Report</h3>
              <p className="text-muted-foreground text-[14px] leading-relaxed mt-1.5 max-w-[260px] mx-auto">
                Full data export with customer name, mobile, all items, subtotal, CGST, SGST and total — ready for Excel &amp; Google Sheets.
              </p>
            </div>

            {/* What's included */}
            <ul className="w-full text-left space-y-1.5 bg-muted/40 rounded-xl p-4">
              {['Order # &amp; Date/Time', 'Customer Name &amp; Mobile No.', 'Order Type &amp; Status', 'Items (name × qty @ price)', 'Subtotal · CGST · SGST · Total'].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>

            <button
              onClick={handleCSV}
              disabled={filteredOrders.length === 0}
              className={clsx(
                'w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98]',
                filteredOrders.length === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
              )}
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>
        </motion.div>

        {/* PDF Card */}
        <motion.div
          whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgba(0,0,0,0.12)' }}
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group"
        >
          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText size={32} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-foreground tracking-tight">PDF Report</h3>
              <p className="text-muted-foreground text-[14px] leading-relaxed mt-1.5 max-w-[260px] mx-auto">
                Professionally formatted A4 landscape PDF with summary cards and a complete order table — ready to print or share.
              </p>
            </div>

            {/* What's included */}
            <ul className="w-full text-left space-y-1.5 bg-muted/40 rounded-xl p-4">
              {['Period header &amp; summary metrics', 'Customer Name &amp; Mobile No.', 'Order Type &amp; Status (colour-coded)', 'Items summary per order', 'Amount with auto page-breaks'].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>

            <button
              onClick={handlePDF}
              disabled={filteredOrders.length === 0}
              className={clsx(
                'w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98]',
                filteredOrders.length === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
              )}
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </motion.div>
      </div>

      {/* Empty state notice */}
      {filteredOrders.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground py-4"
        >
          No orders found for <span className="font-semibold text-foreground">{range.label}</span>. Try a different period.
        </motion.p>
      )}
    </div>
  );
};
