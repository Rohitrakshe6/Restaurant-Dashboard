import { toast } from 'react-hot-toast';
import type { Order, MenuItem } from '../types';

// ─── CSV Report Generator ─────────────────────────────────────────────────────
export interface CsvReportOptions {
  orders: Order[];
  menu: MenuItem[];
  label: string;
}

export const exportSalesReportCSV = ({ orders, menu, label }: CsvReportOptions) => {
  try {
    const getMenuName  = (id: string) => menu.find(m => m.id === id)?.name  || id;
    const getMenuPrice = (id: string) => menu.find(m => m.id === id)?.price || 0;

    // Escape a CSV cell value
    const esc = (v: string | number | undefined | null) => {
      const str = String(v ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    // ── Summary section ──
    const completed    = orders.filter(o => o.status === 'completed');
    const cancelled    = orders.filter(o => o.status === 'cancelled');
    const totalRevenue = completed.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgOrder     = completed.length ? totalRevenue / completed.length : 0;

    const summaryRows = [
      ['RESTROO — SALES REPORT'],
      [`Period: ${label}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['SUMMARY'],
      ['Total Orders', orders.length],
      ['Completed Orders', completed.length],
      ['Cancelled Orders', cancelled.length],
      ['Total Revenue (₹)', totalRevenue.toFixed(2)],
      ['Average Order Value (₹)', avgOrder.toFixed(2)],
      [],
    ];

    // ── Column headers ──
    const headers = [
      'Order #',
      'Date',
      'Time',
      'Type',
      'Customer Name',
      'Mobile No.',
      'Status',
      'Items (name × qty @ price)',
      'Subtotal (₹)',
      'CGST 2.5% (₹)',
      'SGST 2.5% (₹)',
      'Total Amount (₹)',
    ];

    // ── Order rows ──
    const dataRows = orders.map(order => {
      const subtotal = order.items.reduce((acc, item) => {
        return acc + getMenuPrice(item.menuItemId) * item.quantity;
      }, 0);
      const cgst  = subtotal * 0.025;
      const sgst  = subtotal * 0.025;
      const total = order.totalAmount || subtotal + cgst + sgst;

      const itemsStr = order.items
        .map(i => `${getMenuName(i.menuItemId)} ×${i.quantity} @₹${getMenuPrice(i.menuItemId)}`)
        .join(' | ');

      const dt = new Date(order.createdAt);

      return [
        `#${order.id}`,
        dt.toLocaleDateString(),
        dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        order.type,
        order.customerName || 'Walk-in',
        order.customerMobile || '',
        order.status,
        itemsStr,
        subtotal.toFixed(2),
        cgst.toFixed(2),
        sgst.toFixed(2),
        total.toFixed(2),
      ];
    });

    // ── Build CSV string ──
    const allRows = [
      ...summaryRows.map(r => r.map(esc).join(',')),
      headers.map(esc).join(','),
      ...dataRows.map(r => r.map(esc).join(',')),
    ];

    const csvContent = allRows.join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url  = URL.createObjectURL(blob);

    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Restroo_Report_${label.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Sales Report CSV Downloaded');
  } catch (e) {
    console.error(e);
    toast.error('Failed to generate CSV report');
  }
};
