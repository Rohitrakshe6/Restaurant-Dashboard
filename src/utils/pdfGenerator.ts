import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import type { Order, MenuItem } from '../types';

// ─── Invoice PDF (single order receipt) ──────────────────────────────────────
export const exportInvoicePDF = (order: any, menu: any[], tables: any[], customerName?: string, returnBlob = false) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 200] });

    const subtotal = order.items.reduce((acc: number, item: any) => {
      const menuItem = menu.find((m: any) => m.id === item.menuItemId);
      return acc + (menuItem?.price || 0) * item.quantity;
    }, 0);
    const cgst  = subtotal * 0.025;
    const sgst  = subtotal * 0.025;
    const total = subtotal + cgst + sgst;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Restroo', 40, 16, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(`Invoice #${order.id.slice(-6).toUpperCase()}`, 40, 22, { align: 'center' });

    let y = 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    if (order.customerName) {
      doc.text(`Customer: ${order.customerName}`, 10, y);
      y += 5;
    }
    if (order.customerMobile) {
      doc.text(`Mobile: ${order.customerMobile}`, 10, y);
      y += 5;
    }
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 10, y);
    y += 5;
    doc.text(`Type: ${order.type}`, 10, y);
    y += 5;

    doc.setFontSize(10);
    doc.text('------------------------------------------------------', 40, y, { align: 'center' });
    y += 6;

    order.items.forEach((item: any) => {
      const menuItem = menu.find((m: any) => m.id === item.menuItemId);
      if (menuItem) {
        doc.text(`${item.quantity}x ${menuItem.name.substring(0, 22)}`, 10, y);
        doc.text(`Rs.${(menuItem.price * item.quantity).toFixed(2)}`, 70, y, { align: 'right' });
        y += 6;
      }
    });

    doc.text('------------------------------------------------------', 40, y, { align: 'center' });
    y += 6;

    doc.text(`Subtotal: Rs.${subtotal.toFixed(2)}`, 10, y); y += 6;
    doc.text(`CGST (2.5%): Rs.${cgst.toFixed(2)}`, 10, y); y += 6;
    doc.text(`SGST (2.5%): Rs.${sgst.toFixed(2)}`, 10, y); y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: Rs.${total.toFixed(2)}`, 10, y);
    y += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for visiting Restroo!', 40, y, { align: 'center' });

    if (returnBlob) return doc.output('blob');
    doc.save(`Invoice_${order.id.slice(-6).toUpperCase()}.pdf`);
    toast.success('Invoice PDF Downloaded');
    return null;
  } catch (e) {
    console.error(e);
    toast.error('Failed to generate PDF');
    return null;
  }
};

// ─── Sales Report PDF ─────────────────────────────────────────────────────────
export interface ReportOptions {
  orders: Order[];
  menu: MenuItem[];
  label: string;        // e.g. "Daily – 29 Mar 2026"
  dateFrom?: string;
  dateTo?: string;
}

export const exportSalesReportPDF = ({ orders, menu, label, dateFrom, dateTo }: ReportOptions) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const PAGE_W    = 297;
    const MARGIN    = 14;
    const COL_WIDTHS = [18, 38, 22, 44, 36, 24, 28, 28]; // total ~238mm
    const COLS = ['Order #', 'Date & Time', 'Type', 'Customer', 'Mobile', 'Status', 'Items', 'Amount (Rs.)'];
    const ROW_H = 8;

    const getMenuName = (id: string) => menu.find(m => m.id === id)?.name || id;

    // ── helpers ──
    const drawHLine = (y: number, color = [220, 220, 220] as [number, number, number]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    };

    const drawCell = (text: string, x: number, y: number, w: number, align: 'left' | 'center' | 'right' = 'left', bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, w - 3);
      const firstLine = Array.isArray(lines) ? lines[0] : lines;
      if (align === 'right') {
        doc.text(firstLine, x + w - 2, y, { align: 'right' });
      } else if (align === 'center') {
        doc.text(firstLine, x + w / 2, y, { align: 'center' });
      } else {
        doc.text(firstLine, x + 2, y);
      }
    };

    // ── Totals ──
    const calcOrderTotal = (order: Order) => {
      if (order.totalAmount && order.totalAmount > 0) return order.totalAmount;
      const sub = order.items.reduce((s, item) => {
        const price = menu.find(m => m.id === item.menuItemId)?.price || 0;
        return s + price * item.quantity;
      }, 0);
      return sub + sub * 0.05; // 2.5% CGST + 2.5% SGST
    };

    const completed    = orders.filter(o => o.status === 'completed');
    const cancelled    = orders.filter(o => o.status === 'cancelled');
    const totalRevenue = completed.reduce((s, o) => s + calcOrderTotal(o), 0);

    // ── HEADER ──
    doc.setFillColor(24, 24, 36);
    doc.rect(0, 0, PAGE_W, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Restroo - Sales Report', MARGIN, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, PAGE_W - MARGIN, 8, { align: 'right' });
    doc.text(`Period: ${label}`, PAGE_W - MARGIN, 14, { align: 'right' });
    if (dateFrom && dateTo) {
      doc.text(`${dateFrom} to ${dateTo}`, PAGE_W - MARGIN, 19, { align: 'right' });
    }

    let y = 28;

    // ── TABLE HEADER ──
    doc.setFillColor(24, 24, 36);
    doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, ROW_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    let cx = MARGIN;
    COLS.forEach((col, i) => {
      const align = i === COLS.length - 1 ? 'right' : 'left';
      drawCell(col, cx, y + 5.5, COL_WIDTHS[i], align, true);
      cx += COL_WIDTHS[i];
    });
    y += ROW_H;

    // ── TABLE ROWS ──
    doc.setFontSize(8);
    orders.forEach((order, idx) => {
      // Page break
      if (y > 185) {
        doc.addPage();
        y = 16;
        // Repeat column header
        doc.setFillColor(24, 24, 36);
        doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, ROW_H, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        let hx = MARGIN;
        COLS.forEach((col, i) => {
          const align = i === COLS.length - 1 ? 'right' : 'left';
          drawCell(col, hx, y + 5.5, COL_WIDTHS[i], align, true);
          hx += COL_WIDTHS[i];
        });
        y += ROW_H;
      }

      // Alternating row bg
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 254);
      doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, ROW_H, 'F');

      const itemsSummary = order.items.slice(0, 2).map(i => `${i.quantity}x ${getMenuName(i.menuItemId)}`).join(', ')
        + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '');

      const statusColors: Record<string, [number, number, number]> = {
        completed: [22, 163, 74],
        cancelled: [220, 38, 38],
        active:    [37, 99, 235],
        billing:   [217, 119, 6],
      };
      const sc = statusColors[order.status] || [80, 80, 80];

      const rowData = [
        `#${order.id}`,
        new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        order.type,
        order.customerName || 'Walk-in',
        order.customerMobile || '—',
        order.status.toUpperCase(),
        itemsSummary || '—',
        calcOrderTotal(order).toFixed(2),
      ];

      doc.setFont('helvetica', 'normal');
      cx = MARGIN;
      rowData.forEach((cell, i) => {
        if (i === 5) {
          doc.setTextColor(...sc);
          doc.setFont('helvetica', 'bold');
        } else if (i === rowData.length - 1) {
          doc.setTextColor(24, 24, 36);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(50, 50, 60);
          doc.setFont('helvetica', 'normal');
        }
        const align = i === rowData.length - 1 ? 'right' : 'left';
        drawCell(cell, cx, y + 5.5, COL_WIDTHS[i], align);
        cx += COL_WIDTHS[i];
      });

      drawHLine(y + ROW_H, [230, 230, 240]);
      y += ROW_H;
    });

    // ── TOTALS SUMMARY ROW ──
    if (y > 185) { doc.addPage(); y = 16; }
    drawHLine(y, [24, 24, 36]);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 36);
    doc.text(`Total Orders: ${orders.length}   |   Completed: ${completed.length}   |   Cancelled: ${cancelled.length}   |   Total Revenue: Rs.${totalRevenue.toFixed(2)}`, MARGIN, y);

    // ── FOOTER ──
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 160);
      doc.text(
        `Restroo Restaurant Management  |  Page ${p} of ${pageCount}`,
        PAGE_W / 2, 205, { align: 'center' }
      );
    }

    const filename = `Restroo_Report_${label.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(filename);
    toast.success('Sales Report PDF Downloaded');
  } catch (e) {
    console.error(e);
    toast.error('Failed to generate PDF report');
  }
};
