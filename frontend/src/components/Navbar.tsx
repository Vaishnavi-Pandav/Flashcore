import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const NAV_LINKS = [
  { name: 'Products', href: '/products' },
  { name: 'Categories', href: '/#categories' },
  { name: 'About', href: '/#about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { count, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = count();
  const navigate = useNavigate();

  // Scroll animations
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 100], [100, 70]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(12px)']
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 100],
    ['1px solid rgba(255,255,255,0)', '1px solid rgba(255,255,255,0.1)']
  );

  return (
    <>
      <motion.nav
        style={{
          height,
          backgroundColor,
          backdropFilter,
          borderBottom
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 transition-colors duration-300"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-2xl font-black text-white tracking-tighter cursor-pointer"
        >
          FLASHCORE
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link, idx) => (
            <div
              key={link.name}
              className="relative px-3 py-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="relative z-10 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {link.name}
              </span>
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-white rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions (Auth & Cart & Mobile Toggle) */}
        <div className="flex items-center space-x-6">
          
          {/* User Profile / Login */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm truncate max-w-[150px] transition-colors">
                  {user?.email}
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            )}
          </div>

          {/* Cart Icon with animated badge */}
          <div className="relative cursor-pointer group" onClick={openCart}>
            <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.div
                  key={cartCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                >
                  {cartCount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-gray-900 border-l border-white/10 z-[70] p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-black text-white tracking-tighter">
                  MENU
                </span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                {NAV_LINKS.map((link, idx) => (
                  <React.Fragment key={link.name}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="block text-2xl font-bold text-white mb-6"
                        onClick={() => {
                          setIsOpen(false);
                        }}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="block text-2xl font-bold text-white mb-6"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
            
                <div className="w-full h-px bg-zinc-800 my-6" />
            
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-400 hover:text-white text-sm transition-colors">
                      {user?.email} (Dashboard)
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block text-xl font-bold text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="block text-2xl font-bold text-purple-400 mb-6"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
