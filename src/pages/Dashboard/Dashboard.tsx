import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { mockMenu } from '../../services/mockData';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';
import { format, subDays } from 'date-fns';

const PIE_COLORS = ['#607D8B', '#B0BEC5', '#333333', '#FFEBEE', '#78909C'];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="relative overflow-hidden bg-card border border-border/80 rounded-[24px] p-7 shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col justify-between h-[160px] group"
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-muted/50 text-muted-foreground rounded-[12px] border border-border/60 group-hover:text-foreground group-hover:bg-muted transition-colors">
          <Icon size={18} strokeWidth={2.5}/>
        </div>
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      </div>
      {trend && (
        <span className={clsx(
          "flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full", 
          trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        )}>
          {trend === 'up' ? <TrendingUp size={12} strokeWidth={3}/> : <TrendingUp size={12} strokeWidth={3} className="rotate-180" />}
          {trendValue}%
        </span>
      )}
    </div>
    <div className="mt-auto">
      <h3 className="text-4xl font-black text-foreground tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useRestaurantStore();
  
  const activeOrders = orders.filter(o => o.status === 'active').length;
  
  const todaysRevenue = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status === 'completed')
    .reduce((sum, order) => {
      const orderTotal = order.items.reduce((s,i) => s + ((mockMenu.find(m=>m.id === i.menuItemId)?.price||0)*i.quantity), 0);
      return sum + (order.totalAmount || orderTotal);
    }, 0);

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const avgOrderValue = completedOrders > 0 ? Math.round(todaysRevenue / completedOrders) : 0;
  
  const revenueData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toDateString();
      const dayRevenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === dateStr && o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalAmount || o.items.reduce((s,item) => s + ((mockMenu.find(m=>m.id === item.menuItemId)?.price||0)*item.quantity), 0)), 0);
      
      data.push({
        name: i === 0 ? 'Today' : format(d, 'MMM dd'),
        revenue: dayRevenue
      });
    }
    return data;
  }, [orders]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    orders.filter(o => o.status === 'completed').forEach(order => {
      order.items.forEach(item => {
        const menuItem = mockMenu.find(m => m.id === item.menuItemId);
        if (menuItem) {
          categories[menuItem.category] = (categories[menuItem.category] || 0) + item.quantity;
        }
      });
    });

    const formatted = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); 
      
    if (formatted.length === 0) {
      return [{ name: 'No Sales Yet', value: 1 }];
    }
    return formatted;
  }, [orders]);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-[32px] font-black text-foreground tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1 text-[15px] font-medium">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue" value={`₹${todaysRevenue}`} icon={DollarSign} trend="up" trendValue={12.5} delay={0.1} />
        <StatCard title="Active" value={activeOrders.toString()} icon={ShoppingBag} trend="up" trendValue={4.2} delay={0.2} />
        <StatCard title="Competed" value={completedOrders.toString()} icon={Users} delay={0.3} />
        <StatCard title="Avg Value" value={`₹${avgOrderValue}`} icon={TrendingUp} delay={0.4} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 bg-card p-6 md:p-8 rounded-[32px] shadow-sm border border-border/80 flex flex-col"
        >
          <div className="mb-8">
            <h3 className="font-extrabold text-foreground text-[20px] tracking-tight">Revenue Trend</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Daily income over the last 7 days</p>
          </div>
          <div className="h-[320px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 600}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}} 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }} 
                  formatter={(value: any) => [`₹${value}`, 'Revenue']} 
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Sales PieChart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-card p-6 md:p-8 rounded-[32px] shadow-sm border border-border/80 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="font-extrabold text-foreground text-[20px] tracking-tight">Sales Categories</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Distribution by menu category</p>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
            {completedOrders === 0 ? (
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
                <p className="text-foreground font-bold">No sales data</p>
                <p className="text-sm text-muted-foreground mt-1">Complete orders to see insights</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '12px 16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {completedOrders > 0 && (
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-8">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-3 text-sm font-bold text-foreground">
                  <div className="w-3.5 h-3.5 rounded-[4px] flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border/80 rounded-[32px] shadow-sm overflow-hidden"
      >
        <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-foreground text-[20px] tracking-tight">Recent Orders</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Latest transactions across all tables</p>
          </div>
          <button 
            onClick={() => navigate('/history')}
            className="text-sm font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            View All <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-4 text-[12px] uppercase text-muted-foreground font-bold tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-8 py-4 text-[12px] uppercase text-muted-foreground font-bold tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="px-8 py-4 text-[12px] uppercase text-muted-foreground font-bold tracking-widest whitespace-nowrap">Status</th>
                <th className="px-8 py-4 text-[12px] uppercase text-muted-foreground font-bold tracking-widest whitespace-nowrap">Items</th>
                <th className="px-8 py-4 text-[12px] uppercase text-muted-foreground font-bold tracking-widest whitespace-nowrap text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const total = order.totalAmount || order.items.reduce((s,i) => s + ((mockMenu.find(m=>m.id === i.menuItemId)?.price||0)*i.quantity), 0);
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors last:border-0">
                    <td className="px-8 py-6 font-bold text-foreground">#{order.id.slice(-6)}</td>
                    <td className="px-8 py-6 text-muted-foreground text-sm font-semibold">{format(new Date(order.createdAt), 'MMM dd, hh:mm a')}</td>
                    <td className="px-8 py-6">
                      <span className={clsx(
                        "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest",
                        order.status === 'completed' ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                        order.status === 'billing' ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                        "bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground text-sm font-semibold">{order.items.length} items</td>
                    <td className="px-8 py-6 text-right font-black text-foreground text-[15px]">₹{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground font-bold">No recent orders found.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
