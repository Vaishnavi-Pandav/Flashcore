import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, Users, Settings, DollarSign, Package, TrendingUp 
} from 'lucide-react';
import ProductsTab from '../components/admin/ProductsTab';

const mockSalesData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 7490 },
];

const mockRecentOrders = [
  { id: '#ORD-092', customer: 'Alice Smith', total: 129.99, status: 'Completed' },
  { id: '#ORD-093', customer: 'Bob Johnson', total: 49.00, status: 'Processing' },
  { id: '#ORD-094', customer: 'Charlie Lee', total: 899.00, status: 'Shipped' },
  { id: '#ORD-095', customer: 'Diana Ross', total: 24.50, status: 'Pending' },
];

const SIDEBAR_LINKS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// -- Animated Counter Component
function AnimatedCounter({ value, prefix = "" }: { value: number, prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (val) => setDisplayValue(Math.floor(val))
    });
    return () => controls.stop();
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
}

// -- Main Admin Dashboard
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-black flex pt-[72px]">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-purple-500">Panel</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-indicator"
                    className="absolute inset-0 bg-purple-600/20 border border-purple-500/30 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="font-medium relative z-10">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
          <div className="flex gap-4">
            <button className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors">
              Export Data
            </button>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              New Report
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <DollarSign className="w-24 h-24 text-purple-500" />
                </div>
                <h3 className="text-zinc-400 text-sm font-medium mb-2 relative z-10">Total Revenue</h3>
                <div className="text-3xl font-bold text-white relative z-10">
                  <AnimatedCounter value={37590} prefix="$" />
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm font-medium relative z-10">
                  <TrendingUp className="w-4 h-4 mr-1" /> +12.5% from last month
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <ShoppingBag className="w-24 h-24 text-purple-500" />
                </div>
                <h3 className="text-zinc-400 text-sm font-medium mb-2 relative z-10">Total Orders</h3>
                <div className="text-3xl font-bold text-white relative z-10">
                  <AnimatedCounter value={1248} />
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm font-medium relative z-10">
                  <TrendingUp className="w-4 h-4 mr-1" /> +8.2% from last month
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Users className="w-24 h-24 text-purple-500" />
                </div>
                <h3 className="text-zinc-400 text-sm font-medium mb-2 relative z-10">Active Users</h3>
                <div className="text-3xl font-bold text-white relative z-10">
                  <AnimatedCounter value={5923} />
                </div>
                <div className="mt-4 flex items-center text-red-400 text-sm font-medium relative z-10">
                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" /> -2.4% from last month
                </div>
              </div>
            </div>

            {/* Charts & Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-medium mb-6">Revenue Over Time</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} />
                      <YAxis stroke="#71717a" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#c084fc' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#9333ea" 
                        strokeWidth={3}
                        dot={{ fill: '#9333ea', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#c084fc' }}
                        animationDuration={2000} // Recharts native animation
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-medium">Recent Orders</h3>
                  <button className="text-purple-400 text-sm hover:text-purple-300">View All</button>
                </div>
                <div className="space-y-4">
                  {mockRecentOrders.map((order, i) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex justify-between items-center p-3 hover:bg-zinc-800/50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{order.id}</p>
                        <p className="text-zinc-500 text-xs">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-bold">${order.total.toFixed(2)}</p>
                        <motion.span 
                          layout
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                            order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {order.status}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProductsTab />
          </motion.div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && activeTab !== 'products' && (
          <div className="flex items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
            Content for {activeTab} is under construction
          </div>
        )}
      </main>
    </div>
  );
}
