import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Package, User as UserIcon, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="dashboard-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'wishlist' && <WishlistTab />}
        </div>
      </div>
    </div>
  );
}

// ── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch orders from the backend API
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8000/orders/');
      return res.data;
    }
  });

  if (isLoading) return <div className="text-zinc-400">Loading orders...</div>;
  if (error) return <div className="text-red-400">Failed to load orders.</div>;
  if (!orders || orders.length === 0) return <div className="text-zinc-400">No orders found.</div>;

  return (
    <div className="space-y-4">
      {orders.map((order: any) => {
        const isExpanded = expandedId === order.id;
        return (
          <motion.div
            key={order.id}
            layout
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div 
              className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div>
                <p className="text-sm text-zinc-400 mb-1">Order ID: {order.id}</p>
                <p className="text-white font-medium">Status: {order.status}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-zinc-400 mb-1">Total</p>
                  <p className="text-purple-400 font-bold">${(order.total_amount || 0).toFixed(2)}</p>
                </div>
                <div className="text-zinc-500">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border-t border-zinc-800"
                >
                  <div className="p-6 bg-zinc-950/50">
                    <h4 className="text-white font-medium mb-4">Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-300">{item.product?.name || `Product ID: ${item.product_id}`} x {item.quantity}</span>
                          <span className="text-zinc-400">${(item.price_at_time || 0).toFixed(2)}</span>
                        </div>
                      ))}
                      {!order.items?.length && (
                        <div className="text-zinc-500 text-sm">No items detailed in this order.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Use React Query to manage the profile state optimistically
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => ({ name: user?.email?.split('@')[0] || 'User', phone: '(555) 123-4567' }), // Mock initial fetch
    initialData: { name: user?.email?.split('@')[0] || 'User', phone: '(555) 123-4567' },
  });

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, you'd do: await axios.put('/auth/me', updatedData);
      return updatedData;
    },
    onMutate: async (newProfile) => {
      // Optimistic update logic
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], newProfile);
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
    },
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, phone });
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-500 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>

        {updateProfileMutation.isSuccess && (
          <p className="text-green-400 text-sm text-center">Profile updated successfully!</p>
        )}
      </form>
    </div>
  );
}

// ── Wishlist Tab ──────────────────────────────────────────────────────────────

function WishlistTab() {
  const [wishlist, setWishlist] = useState([
    { id: '1', name: 'Quantum Processor X', price: 999.00, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80' },
    { id: '2', name: 'Neural Keyboard', price: 149.99, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80' },
    { id: '3', name: 'Holo Display Pro', price: 1299.00, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80' },
  ]);

  const handleRemove = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  if (wishlist.length === 0) return <div className="text-zinc-400">Your wishlist is empty.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <AnimatePresence>
        {wishlist.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group relative"
          >
            <div className="aspect-[4/3] bg-zinc-800 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/80 backdrop-blur-md text-white p-2 rounded-full transition-colors z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-white font-medium mb-2">{item.name}</h3>
              <p className="text-purple-400 font-bold">${item.price.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
