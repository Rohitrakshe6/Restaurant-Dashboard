import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { Search, Plus, Minus, Trash2, Tag, Utensils, CheckCircle, Coffee, Check, Receipt, CreditCard, History } from 'lucide-react';
import clsx from 'clsx';
import type { Order, MenuItem } from '../../types';

export const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    orders, tables, menu, addOrderItem, updateOrderItemQuantity, 
    createNewOrder, selectedTable, setSelectedTable, addMenuItem, generateBill
  } = useRestaurantStore();
  
  const currentOrderId = searchParams.get('id');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeOrders = orders.filter(o => o.status === 'active');
  const currentOrder = orders.find(o => o.id === currentOrderId);
  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const [filterType, setFilterType] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const isNewOrderActive = selectedTable && !activeOrders.find(o => o.tableId === selectedTable.id);
  const displayOrders = [...activeOrders];
  if (isNewOrderActive && selectedTable) {
    displayOrders.unshift({
      id: 'draft',
      tableId: selectedTable.id,
      type: 'dine-in',
      items: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      totalAmount: 0
    } as any);
  }

  const filteredMenu = menu.filter(m => 
    (selectedCategory === 'All' || m.category === selectedCategory) &&
    (filterType === 'All' || (filterType === 'Veg' ? m.isVeg : !m.isVeg)) &&
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrderSelect = (id: string) => {
    setSearchParams({ id });
  };

  const handleCreateOrder = (tableId?: string) => {
    const newId = createNewOrder(tableId, 'dine-in');
    setSearchParams({ id: newId });
  };

  const handleItemClick = (menuItem: MenuItem) => {
    if (currentOrderId) {
      const existingItem = orders.find(o => o.id === currentOrderId)?.items.find(i => i.menuItemId === menuItem.id);
      if (existingItem) {
        updateOrderItemQuantity(currentOrderId, existingItem.id, 0);
      } else {
        addOrderItem(currentOrderId, menuItem);
      }
    } else if (selectedTable) {
      const existingId = orders.find(o => o.tableId === selectedTable.id && o.status === 'active')?.id;
      const targetId = existingId || createNewOrder(selectedTable.id, 'dine-in');
      setSearchParams({ id: targetId });
      setTimeout(() => addOrderItem(targetId, menuItem), 0);
    }
  };

  const handleDone = () => {
    setSelectedTable(null);
    setSearchParams({});
  };

  useEffect(() => {
    if (selectedTable && !searchParams.get('id')) {
      const existingOrder = orders.find(o => o.tableId === selectedTable.id && o.status === 'active');
      if (existingOrder) {
        setSearchParams({ id: existingOrder.id });
      }
    }
  }, [selectedTable, searchParams, orders, setSearchParams]);

  const calculateTotal = (order: Order) => {
    return order.items.reduce((total, item) => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 overflow-hidden pb-4">
      
      {/* Column 1: Active Orders List */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[280px] bg-card rounded-2xl border border-border flex flex-col overflow-hidden shrink-0 shadow-sm"
      >
        <div className="p-6 pb-2">
          <h2 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">ACTIVE ORDERS</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 custom-scrollbar">
          {displayOrders.length === 0 ? (
            <div className="text-center p-6 opacity-50 flex flex-col items-center">
              <Utensils className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="font-medium text-sm">No active orders</p>
            </div>
          ) : (
            displayOrders.map((order, i) => {
              const table = tables.find(t => t.id === order.tableId);
              const isSelected = order.id === 'draft' ? (!currentOrderId && selectedTable?.id === order.tableId) : (currentOrderId === order.id);
              
              return (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  onClick={() => order.id === 'draft' ? setSearchParams({}) : handleOrderSelect(order.id)}
                  className={clsx(
                    "w-full p-4 text-left transition-all outline-none border rounded-xl",
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-background hover:bg-muted/50 border-border hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-base text-foreground flex items-center gap-2">
                      {table ? `Table ${table.number}` : `Order #${order.id.slice(-4)}`}
                    </span>
                    <span className={clsx(
                      "text-[11px] font-bold px-3 py-1 rounded-full border transition-all shadow-sm",
                      order.id === 'draft' 
                        ? (isSelected ? "bg-amber-500 text-white border-amber-600 shadow-amber-200/50" : "bg-amber-100 text-amber-700 border-amber-200")
                        : (isSelected ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200/50" : "bg-emerald-100 text-emerald-700 border-emerald-200")
                    )}>
                      {order.id === 'draft' ? 'NEW' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <span>{order.items.length} items • ₹{calculateTotal(order as Order)}</span>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Column 2: Menu Browser */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-card rounded-2xl border border-border flex flex-col overflow-hidden shadow-sm"
      >
        <div className="p-6 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">MENU</h2>
          </div>
          <div className="relative group mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border hover:border-border/80 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 pb-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-foreground hover:border-primary/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pb-4">
            {['All', 'Veg', 'Non-Veg'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={clsx(
                  "px-3 py-1 text-xs font-bold rounded-full transition-all border",
                  filterType === type 
                    ? type === 'Veg' ? "bg-green-100 text-green-700 border-green-500" : type === 'Non-Veg' ? "bg-red-100 text-red-700 border-red-500" : "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
          <div className="flex flex-col gap-3">
            <AnimatePresence>
            {filteredMenu.map((menuItem, i) => {
              const inOrder = currentOrder?.items.some(item => item.menuItemId === menuItem.id) || false;
              return (
              <motion.button
                layout
                key={menuItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                whileHover={(currentOrderId || selectedTable) ? { scale: 1.01 } : {}}
                whileTap={(currentOrderId || selectedTable) ? { scale: 0.98 } : {}}
                onClick={() => handleItemClick(menuItem)}
                disabled={!(currentOrderId || selectedTable)}
                className={clsx(
                  "w-full bg-background hover:border-primary/40 border border-border rounded-xl py-3 px-4 flex items-center justify-between transition-all group shadow-sm",
                  !(currentOrderId || selectedTable) && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-muted-foreground w-10 text-left whitespace-nowrap">₹{menuItem.price}</span>
                  <div className="flex items-center gap-2.5">
                    <div className={clsx("w-3.5 h-3.5 border flex flex-col items-center justify-center rounded-[3px]", menuItem.isVeg ? "border-green-600" : "border-red-600")}>
                      <div className={clsx("w-1.5 h-1.5 rounded-full", menuItem.isVeg ? "bg-green-600" : "bg-red-600")} />
                    </div>
                    <span className="font-bold text-[15px] text-foreground leading-tight text-left">{menuItem.name}</span>
                  </div>
                </div>
                <div className={clsx(
                  "transition-all flex items-center justify-center w-5 h-5 rounded border",
                  (currentOrderId || selectedTable) 
                    ? (inOrder ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 group-hover:border-primary") 
                    : "border-muted-foreground/20 opacity-50"
                )}>
                  {inOrder && <Check size={14} strokeWidth={3} />}
                </div>
              </motion.button>
              )
            })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Column 3: Order Summary */}
      {/* Column 3: Order Summary */}
      {(currentOrder || selectedTable) ? (
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[340px] bg-card rounded-2xl border border-border flex flex-col overflow-hidden shrink-0 shadow-sm"
        >
          <div className="p-6 pb-2">
            <h2 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {selectedTable ? `TABLE ${selectedTable.number} - ORDER` : (currentOrder ? `ORDER #${currentOrder.id.slice(-4)}` : 'NEW ORDER')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            <AnimatePresence>
              {!currentOrder || currentOrder.items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center opacity-60 pb-12"
                >
                  <Utensils className="w-12 h-12 mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-[15px] text-foreground font-semibold">
                    No items added
                  </p>
                  <p className="text-sm text-muted-foreground font-medium mt-1 mb-8 max-w-[200px]">
                    Select items from the menu to build your order
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4 py-2 pb-6">
                  {currentOrder.items.map(item => {
                    const menuItem = menu.find(m => m.id === item.menuItemId);
                    if (!menuItem) return null;
                    return (
                      <motion.div layout key={item.id} className="flex flex-col gap-2 relative group pb-4 border-b border-border/50 last:border-0">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-base text-foreground leading-tight pr-2">{menuItem.name}</span>
                          <span className="font-semibold text-base text-foreground">₹{menuItem.price * item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground mr-auto">₹{menuItem.price} each</span>
                          <div className="flex items-center gap-3 bg-muted/40 rounded-lg p-1 border border-border/50">
                            <button onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-background rounded-md shadow-sm border border-border hover:bg-muted text-foreground transition-colors group-hover:border-primary/30">
                              {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={14} strokeWidth={2.5} />}
                            </button>
                            <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-background rounded-md shadow-sm border border-border hover:bg-muted text-foreground transition-colors group-hover:border-primary/30">
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 pt-4 border-t border-border mt-auto bg-background/50">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm text-foreground">
                <span className="font-medium text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-[15px]">₹{currentOrder ? calculateTotal(currentOrder) : 0}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-border/80">
                <span className="font-extrabold text-base text-foreground uppercase tracking-wider">Total</span>
                <span className="font-black text-xl text-primary">
                  ₹{currentOrder ? calculateTotal(currentOrder) : 0}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleDone}
                className="flex-1 bg-card hover:bg-muted text-foreground border border-border font-bold text-sm py-3 rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                Save
              </button>
              <button 
                onClick={() => {
                  if (currentOrder) {
                    generateBill(currentOrder.id);
                    navigate(`/billing?id=${currentOrder.id}`);
                  }
                }}
                disabled={!currentOrder || currentOrder.items.length === 0}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide text-sm py-3 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[340px] bg-card rounded-2xl border border-border flex flex-col items-center justify-center text-center p-8 shrink-0 shadow-sm"
        >
          <div className="w-full text-left mb-auto">
            <h2 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              ORDER
            </h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-[200px] mb-auto">
            Select an active order or table
          </p>
        </motion.div>
      )}

    </div>
  );
};
