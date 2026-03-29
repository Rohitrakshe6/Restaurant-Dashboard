import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { Search, Receipt, Smartphone, CheckCircle, Store, FileText, User, Download } from 'lucide-react';
import { exportInvoicePDF } from '../../utils/pdfGenerator';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

export const Billing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initId = searchParams.get('id');
  const { orders, tables, menu, markOrderPaid } = useRestaurantStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initId);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = (order: any) => {
    exportInvoicePDF(order, menu, tables, customerName);
  };

  useEffect(() => {
    if (initId) setSelectedOrderId(initId);
  }, [initId]);
  const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'billing');
  const selectedOrder = activeOrders.find(o => o.id === selectedOrderId);

  const filteredOrders = activeOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tables.find(t => t.id === o.tableId)?.number.toString().includes(searchQuery)
  );

  const calculateTotal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;
    return order.items.reduce((total, item) => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!selectedOrder) return;
    
    if (mobileNumber && mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const subtotal = calculateTotal(selectedOrder.id);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const finalTotal = subtotal + cgst + sgst;

    let waLink = '';
    const isNameActuallyNumber = /^\d{10}$/.test(customerName.trim());
    const finalMobile = (mobileNumber && mobileNumber.length === 10) ? mobileNumber : (isNameActuallyNumber ? customerName.trim() : '');

    if (finalMobile) {
      let text = `*Restroo*\n_Invoice #${selectedOrder.id.slice(-6).toUpperCase()}_\n\n`;
      if (customerName && !isNameActuallyNumber) text += `Customer: ${customerName}\n`;
      text += `--------------------\n`;
      selectedOrder.items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menuItemId);
        if (menuItem) {
          text += `${item.quantity}x ${menuItem.name} - ₹${(menuItem.price * item.quantity).toFixed(2)}\n`;
        }
      });
      text += `--------------------\n`;
      text += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
      text += `CGST (2.5%): ₹${cgst.toFixed(2)}\n`;
      text += `SGST (2.5%): ₹${sgst.toFixed(2)}\n`;
      text += `*Grand Total: ₹${finalTotal.toFixed(2)}*\n\n`;

      text += `Thank you for visiting!`;
      
      waLink = `https://wa.me/91${finalMobile}?text=${encodeURIComponent(text)}`;
    }

    markOrderPaid(selectedOrder.id, isNameActuallyNumber ? '' : customerName, finalMobile || mobileNumber);
    setSelectedOrderId(null);
    setMobileNumber('');
    setCustomerName('');
    
    if (waLink) {
      // Capture and Copy Image to Clipboard
      if (invoiceRef.current) {
        try {
          const canvas = await html2canvas(invoiceRef.current, {
            backgroundColor: '#ffffff',
            scale: 2, // High quality
          });
          
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            try {
              const data = [new ClipboardItem({ [blob.type]: blob })];
              await navigator.clipboard.write(data);
              toast.success('Invoice copied! Paste (Ctrl+V) in WhatsApp', { 
                icon: '📋',
                duration: 6000 
              });
            } catch (err) {
              console.warn('Clipboard write failed:', err);
              toast.error('Failed to copy image to clipboard.');
            }
          }
        } catch (err) {
          console.error('Image capture failed:', err);
        }
      }
      
      // Open WhatsApp (synchronously after await to avoid popup blockers)
      window.open(waLink, '_blank');
    } else {
      toast.success('Order marked as paid and closed', { icon: '✅' });
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-16 md:top-20 p-3 md:p-4 lg:p-5 flex flex-col lg:flex-row gap-4 lg:gap-5 overflow-hidden bg-background">
      
      {/* Column 1: Billing Queue */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-[400px] xl:w-[480px] bg-card rounded-[24px] border border-border flex flex-col overflow-hidden shrink-0 shadow-sm"
      >
        <div className="p-6 border-b border-border/50 bg-background/50 flex flex-col gap-4">
          <div>
            <h3 className="font-extrabold text-2xl tracking-tight text-foreground">Pending Bills</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Select an active order to collect payment and close the table.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search by Order ID or Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border hover:border-border/80 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {filteredOrders.length === 0 ? (
            <div className="text-center p-8 opacity-50 flex flex-col items-center justify-center h-full">
              <CheckCircle className="w-12 h-12 mb-4 text-muted-foreground stroke-[1.5]" />
              <p className="font-extrabold text-lg text-foreground">Queue is Clear</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">There are no active orders ready for checkout.</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => {
              const table = tables.find(t => t.id === order.tableId);
              const subtotalAmount = calculateTotal(order.id);
              const totalAmount = subtotalAmount * 1.05;

              return (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={clsx(
                    "w-full p-5 rounded-[20px] text-left transition-all border outline-none group relative overflow-hidden",
                    selectedOrderId === order.id
                      ? "bg-[#09090b] text-white shadow-lg ring-4 ring-black/5 scale-[1.01] z-10"
                      : "bg-card hover:bg-muted/40 border-border hover:border-border/80 text-foreground hover:shadow-sm"
                  )}
                >
                  {selectedOrderId === order.id && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[100px] pointer-events-none" />
                  )}
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-sm border",
                        selectedOrderId === order.id ? "bg-white/10 border-white/10 text-white" : "bg-muted border-border/50 text-foreground"
                      )}>
                        T{table?.number || '?'}
                      </div>
                      <div>
                        <span className="font-extrabold text-[17px] block leading-tight">Table {table?.number}</span>
                        <span className="text-[14px] font-semibold opacity-70">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={clsx(
                        "font-black text-[19px] tracking-tight block",
                        selectedOrderId !== order.id && "text-primary"
                      )}>
                        ₹{totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[12px] font-bold uppercase tracking-wider opacity-70">
                        {order.items.length} Items
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Column 2: Invoice & Checkout */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-card rounded-[24px] border border-border flex flex-col overflow-hidden shadow-sm relative"
      >
        {selectedOrder ? (
          <div className="flex flex-col h-full bg-card">
            <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center shrink-0 z-10 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/80 text-foreground flex items-center justify-center">
                  <Receipt size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[20px] tracking-tight text-foreground">Invoice #{selectedOrder.id.slice(-6)}</h3>
                  <p className="text-[15px] font-semibold text-muted-foreground mt-0.5">
                    {tables.find(t => t.id === selectedOrder.tableId) ? `Dining • Table ${tables.find(t => t.id === selectedOrder.tableId)?.number}` : "Takeaway Order"}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleExportPDF(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm shadow-sm active:scale-[0.98]"
              >
                <Download size={18} /> Download PDF
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex justify-center relative custom-scrollbar bg-[radial-gradient(hsl(var(--foreground)/0.03)_1px,transparent_1px)] [background-size:16px_16px]">
              
              <div 
                ref={invoiceRef}
                className="w-full max-w-[850px] bg-card h-max relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.02)] min-h-full"
              >
                
                <div className="px-6 py-8">
                  <div className="text-center mb-5">
                    <h2 className="font-black text-2xl tracking-tight text-foreground mb-1">Restroo</h2>
                    <p className="text-[14px] text-muted-foreground font-medium">ambegaon bk. ,pune</p>
                    <div className="flex items-center justify-center gap-4 mt-1 text-[12px] text-muted-foreground/80 font-medium">
                      <span>GSTIN: 123456984787</span>
                    </div>
                  </div>
                  
                  <div className="w-full border-b-[2px] border-foreground mb-5" />

                  <div className="flex justify-between items-start mb-6 text-[14px]">
                    <div className="space-y-1">
                      <p><span className="font-bold text-foreground">Invoice:</span> <span className="text-muted-foreground">INV-{selectedOrder.id.slice(-6).toUpperCase()}</span></p>
                      <p><span className="font-bold text-foreground">Date:</span> <span className="text-muted-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold text-foreground">Customer:</span> <span className="text-muted-foreground">{customerName || 'Walk-in'}</span></p>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse mb-6">
                    <thead>
                      <tr className="bg-muted/30 border-y border-border/80 text-[13px]">
                        <th className="py-2 px-3 font-bold text-foreground w-12 text-center">#</th>
                        <th className="py-2 px-3 font-bold text-foreground">Item</th>
                        <th className="py-2 px-3 font-bold text-foreground text-center">Qty</th>
                        <th className="py-2 px-3 font-bold text-foreground text-right w-24">Price</th>
                        <th className="py-2 px-3 font-bold text-foreground text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px]">
                      {selectedOrder.items.map((item, index) => {
                        const menuItem = menu.find(m => m.id === item.menuItemId);
                        if (!menuItem) return null;
                        return (
                          <tr key={item.id} className="border-b border-border/50 text-muted-foreground">
                            <td className="py-2.5 px-3 text-center">{index + 1}</td>
                            <td className="py-2.5 px-3 font-medium">{menuItem.name}</td>
                            <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right">₹{menuItem.price.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right text-foreground font-medium">₹{(menuItem.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-[280px] text-[14px]">
                      <div className="flex justify-between py-1.5 text-muted-foreground font-medium">
                        <span>Subtotal</span>
                        <span className="text-foreground">₹{calculateTotal(selectedOrder.id).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-muted-foreground font-medium">
                        <span>CGST (2.5%)</span>
                        <span className="text-foreground">₹{(calculateTotal(selectedOrder.id) * 0.025).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-muted-foreground font-medium mb-3">
                        <span>SGST (2.5%)</span>
                        <span className="text-foreground">₹{(calculateTotal(selectedOrder.id) * 0.025).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-t-[2px] border-foreground/90 font-black text-[16px]">
                        <span className="text-foreground">Grand Total</span>
                        <span className="text-foreground">₹{(calculateTotal(selectedOrder.id) * 1.05).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="p-4 bg-card shrink-0 flex flex-col gap-3 z-10 border-t border-border/50">
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-foreground" />
                  <input
                    type="text"
                    placeholder="Customer (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-muted/40 border border-border/60 hover:border-border/80 rounded-[14px] pl-[2.75rem] pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/20 focus:border-foreground transition-all text-[14px] font-bold shadow-sm placeholder:font-semibold"
                  />
                </div>
                <div className="flex-1 relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-[hsl(142,71%,45%)]" />
                  <input
                    type="tel"
                    placeholder="WhatsApp No."
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10}
                    className="w-full bg-muted/40 border border-border/60 hover:border-border/80 rounded-[14px] pl-[2.75rem] pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20 focus:border-[hsl(142,71%,45%)] transition-all text-[14px] font-bold shadow-sm placeholder:font-semibold"
                  />
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className={clsx(
                  "w-full py-3 rounded-[14px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-black text-[15px] uppercase tracking-wide",
                  (mobileNumber.length >= 10 || /^\d{10}$/.test(customerName.trim()))
                    ? "bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)] text-white" 
                    : "bg-[#09090b] hover:bg-[#18181b] text-white"
                )}
              >
                {(mobileNumber.length >= 10 || /^\d{10}$/.test(customerName.trim())) ? (
                  <>Send Bill on WhatsApp</>
                ) : (
                  <>Mark as Paid</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 p-8 bg-card relative z-10">
            <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
               <FileText size={40} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="font-black text-[22px] text-foreground tracking-tight">Select an Invoice</h3>
            <p className="text-[15px] mt-3 font-medium text-muted-foreground max-w-[300px] leading-relaxed">
              Choose an active order from the queue to process payment and send the digital receipt.
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
};
