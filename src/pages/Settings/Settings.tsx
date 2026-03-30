import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Building2, Bell, Shield, Utensils, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import clsx from 'clsx';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { menu, addMenuItem, removeMenuItem, restaurantInfo, updateRestaurantInfo } = useRestaurantStore();

  const [localInfo, setLocalInfo] = React.useState({ ...restaurantInfo });

  const handleSave = () => {
    updateRestaurantInfo(localInfo);
    toast.success('Settings saved successfully');
  };

  const handleAddMenu = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isVegStr = formData.get('isVeg') as string;

    if (name && priceStr && category) {
      addMenuItem({
        name,
        price: parseFloat(priceStr),
        category,
        isVeg: isVegStr === 'veg',
      });
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="font-bold text-2xl text-foreground">Restaurant Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your restaurant operations and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button onClick={() => setActiveTab('general')} className={clsx("w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium", activeTab === 'general' ? "font-bold" : "hover:bg-muted")} style={activeTab === 'general' ? { borderLeft: '3px solid var(--color-primary)', backgroundColor: '#F0FDF4', color: 'var(--color-primary)', paddingLeft: '13px' } : { color: 'var(--color-nav-text)' }}>
            <Building2 size={18} /> General
          </button>
          <button onClick={() => setActiveTab('menu')} className={clsx("w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium", activeTab === 'menu' ? "font-bold" : "hover:bg-muted")} style={activeTab === 'menu' ? { borderLeft: '3px solid var(--color-primary)', backgroundColor: '#F0FDF4', color: 'var(--color-primary)', paddingLeft: '13px' } : { color: 'var(--color-nav-text)' }}>
            <Utensils size={18} /> Menu
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted font-medium flex items-center gap-2 transition-colors" style={{ color: 'var(--color-nav-text)' }}>
            <User size={18} /> Staff
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted font-medium flex items-center gap-2 transition-colors" style={{ color: 'var(--color-nav-text)' }}>
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted font-medium flex items-center gap-2 transition-colors" style={{ color: 'var(--color-nav-text)' }}>
            <Shield size={18} /> Security
          </button>
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6"
        >
          {activeTab === 'general' && (
            <>
              <div>
                <h3 className="font-bold text-lg mb-4 text-foreground">Restaurant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Restaurant Name</label>
                    <input type="text" value={localInfo.name} onChange={e => setLocalInfo(p => ({ ...p, name: e.target.value }))} className="w-full bg-background font-medium text-foreground border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Contact / Mobile Number</label>
                    <input type="text" value={localInfo.phone} onChange={e => setLocalInfo(p => ({ ...p, phone: e.target.value }))} className="w-full bg-background font-medium text-foreground border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-muted-foreground">Address</label>
                    <textarea rows={3} value={localInfo.address} onChange={e => setLocalInfo(p => ({ ...p, address: e.target.value }))} className="w-full bg-background font-medium text-foreground border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-[15px]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="font-bold text-lg mb-4 text-foreground">Tax & Billing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">GST Number</label>
                    <input type="text" value={localInfo.gst} onChange={e => setLocalInfo(p => ({ ...p, gst: e.target.value }))} placeholder="Leave blank if not applicable" className="w-full bg-background font-medium text-foreground border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Default Tax Rate (%)</label>
                    <input type="number" defaultValue="5" className="w-full bg-background font-medium text-foreground border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-[15px]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-foreground">Add Menu Item</h3>
                <form onSubmit={handleAddMenu} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Item Name</label>
                    <input required name="name" type="text" placeholder="e.g. Paneer Butter Masala" className="w-full bg-background font-medium border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Price (₹)</label>
                    <input required name="price" type="number" step="1" placeholder="250" className="w-full bg-background font-medium border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                    <input required name="category" type="text" placeholder="Mains" className="w-full bg-background font-medium border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Dietary</label>
                    <select name="isVeg" className="w-full bg-background font-medium border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                  </div>
                  <div className="md:col-span-5 flex justify-end mt-2">
                    <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-lg transition-all flex items-center gap-2 active:scale-95">
                      <Plus size={16} /> Add to Menu
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-foreground">Current Menu ({menu.length} items)</h3>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {menu.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-3.5 h-3.5 border flex flex-col items-center justify-center rounded-[3px]", item.isVeg ? "border-green-600" : "border-red-600")}>
                          <div className={clsx("w-1.5 h-1.5 rounded-full", item.isVeg ? "bg-green-600" : "bg-red-600")} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-[15px]">{item.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-muted-foreground text-[14px]">₹{item.price}</span>
                        <button onClick={() => removeMenuItem(item.id)} className="p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-500 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
