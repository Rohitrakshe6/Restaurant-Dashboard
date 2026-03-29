import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Table, MenuItem, Order, OrderItem } from '../types';
import { mockTables, mockMenu } from '../services/mockData';
import toast from 'react-hot-toast';

interface RestaurantState {
  orderSequence: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  verificationCode: string | null;
  tempUser: any | null;
  login: () => void;
  logout: () => void;
  loginAsGuest: () => void;
  sendVerificationCode: (email: string, userData: any) => void;
  verifyCode: (code: string) => boolean;
  tables: Table[];
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  removeMenuItem: (id: string) => void;
  orders: Order[];
  addOrderItem: (orderId: string, item: MenuItem, quantity?: number) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, quantity: number) => void;
  createNewOrder: (tableId?: string, type?: 'dine-in' | 'parcel') => string;
  generateBill: (orderId: string) => void;
  markOrderPaid: (orderId: string, customerName?: string, customerMobile?: string) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  updateTableCapacity: (tableId: string, capacity: number) => void;
  addTable: () => void;
  removeTable: (id: string) => void;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      orderSequence: 0,
      theme: 'light',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      isAuthenticated: false,
      verificationCode: null,
      tempUser: null,
      login: () => set({ isAuthenticated: true, tempUser: null, verificationCode: null }),
      logout: () => {
        set({ isAuthenticated: false, tempUser: null, verificationCode: null });
        toast.success('Signed out successfully');
      },
      loginAsGuest: () => {
        set({ isAuthenticated: true, tempUser: null, verificationCode: null });
        toast.success('Welcome, Guest!', { icon: '👋' });
      },
      sendVerificationCode: (email, userData) => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        set({ verificationCode: code, tempUser: userData });
        console.log(`%c [AUTH] Verification code for ${email}: ${code} `, 'background: #222; color: #bada55; font-size: 1.2rem; font-weight: bold; padding: 4px; border-radius: 4px;');
        toast.success(`Verification code sent to ${email}`, {
          duration: 5000,
          icon: '📧'
        });
      },
      verifyCode: (code) => {
        const state = get();
        if (state.verificationCode === code) {
          set({ isAuthenticated: true, verificationCode: null, tempUser: null });
          return true;
        }
        return false;
      },

      tables: mockTables,
      menu: mockMenu,
      addMenuItem: (item) => set((state) => {
        const newItem: MenuItem = { ...item, id: `m${Date.now()}` };
        toast.success(`Added ${item.name} to menu`);
        return { menu: [...state.menu, newItem] };
      }),
      removeMenuItem: (id) => set((state) => {
        toast.success('Removed menu item');
        return { menu: state.menu.filter(m => m.id !== id) };
      }),
      orders: [],
      selectedTable: null,
      setSelectedTable: (table) => set({ selectedTable: table }),

      addOrderItem: (orderId, menuItem, quantity = 1) => {
        set((state) => {
          const orderIndex = state.orders.findIndex(o => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...state.orders[orderIndex] };
          const existingItemIndex = order.items.findIndex(i => i.menuItemId === menuItem.id);

          if (existingItemIndex >= 0) {
            order.items[existingItemIndex].quantity += quantity;
          } else {
            order.items.push({
              id: Math.random().toString(36).substring(7),
              menuItemId: menuItem.id,
              quantity,
            });
          }

          // Recalculate total
          const newOrders = [...state.orders];
          newOrders[orderIndex] = order;
          return { orders: newOrders };
        });
        toast.success(`Added ${quantity}x ${menuItem.name}`);
      },

      updateOrderItemQuantity: (orderId, itemId, quantity) => {
        set((state) => {
          const orderIndex = state.orders.findIndex(o => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...state.orders[orderIndex] };
          if (quantity <= 0) {
            order.items = order.items.filter(i => i.id !== itemId);
          } else {
            const itemItem = order.items.find(i => i.id === itemId);
            if (itemItem) itemItem.quantity = quantity;
          }

          const newOrders = [...state.orders];
          newOrders[orderIndex] = order;
          return { orders: newOrders };
        });
      },

      createNewOrder: (tableId, type = 'dine-in') => {
        const currentSeq = get().orderSequence || get().orders.length || 0;
        const nextSeq = currentSeq + 1;
        const id = String(nextSeq).padStart(4, '0');
        
        const newOrder: Order = {
          id,
          tableId,
          type,
          items: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          totalAmount: 0,
        };

        set((state) => {
          const updates: Partial<RestaurantState> = { 
            orders: [...state.orders, newOrder],
            orderSequence: nextSeq
          };
          if (tableId) {
            updates.tables = state.tables.map(t => 
              t.id === tableId ? { ...t, status: 'occupied', currentOrderId: id } : t
            );
          }
          return updates;
        });
        
        toast.success('New order created');
        return id;
      },

      generateBill: (orderId) => {
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (!order) return state;

          const updates: Partial<RestaurantState> = {
            orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'billing' } : o)
          };

          if (order.tableId) {
            updates.tables = state.tables.map(t => 
              t.id === order.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t
            );
          }
          return updates;
        });
        toast.success('Bill generated, table is free', { icon: '🧾' });
      },

      markOrderPaid: (orderId, customerName, customerMobile) => {
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (!order) return state;

          const updates: Partial<RestaurantState> = {
            orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'completed', customerName, customerMobile } : o)
          };

          if (order.tableId) {
            updates.tables = state.tables.map(t => 
              t.id === order.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t
            );
          }
          return updates;
        });
        toast.success('Marked as paid and closed', { icon: '✅' });
      },

      updateTableStatus: (tableId, status) => {
        set((state) => ({
          tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
        }));
      },

      updateTableCapacity: (tableId, capacity) => {
        set((state) => ({
          tables: state.tables.map(t => t.id === tableId ? { ...t, capacity } : t)
        }));
      },

      addTable: () => set((state) => {
        const newNumber = state.tables.length > 0 ? Math.max(...state.tables.map(t => t.number)) + 1 : 1;
        const newTable: Table = {
          id: `t${newNumber}`,
          number: newNumber,
          capacity: 4,
          status: 'available'
        };
        return { tables: [...state.tables, newTable] };
      }),

      removeTable: (id) => set((state) => ({
        tables: state.tables.filter(t => t.id !== id),
        // Also potentially clean up orders, but for simplicity just remove the table
      })),
    }),
    {
      name: 'spice-garden-v2',
      partialize: (state) => ({ 
        orders: state.orders, 
        tables: state.tables, 
        sidebarCollapsed: state.sidebarCollapsed, 
        theme: state.theme, 
        orderSequence: state.orderSequence, 
        menu: state.menu,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
