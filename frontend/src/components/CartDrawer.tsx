import React, { useState } from 'react';
import { motion, AnimatePresence, useAnimate, stagger } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

// ── Animated Number Counter ────────────────────────────────────────────────

const AnimatedPrice = ({ value }: { value: number }) => {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value.toFixed(2)}
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="inline-block tabular-nums"
      >
        ${value.toFixed(2)}
      </motion.span>
    </AnimatePresence>
  );
};

// ── Cart Item Row ──────────────────────────────────────────────────────────

const CartItemRow = ({
  item,
  index,
}: {
  item: { id: string; name: string; price: number; image: string; qty: number; stock: number };
  index: number;
}) => {
  const { removeItem, updateQty } = useCartStore();
  const [scope, animate] = useAnimate();

  const handleRemove = async () => {
    await animate(
      scope.current,
      { x: 60, opacity: 0 },
      { duration: 0.25, ease: 'easeIn' }
    );
    removeItem(item.id);
  };

  return (
    <motion.div
      ref={scope}
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
      className="flex gap-4 py-5 border-b border-zinc-800"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-blue-900/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-white font-semibold text-sm leading-tight truncate pr-2">{item.name}</h4>
          <motion.button
            onClick={handleRemove}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty controls */}
          <div className="flex items-center gap-3 bg-zinc-900 rounded-xl px-3 py-1.5 border border-zinc-800">
            <motion.button
              whileTap={{ scale: 0.75 }}
              onClick={() => updateQty(item.id, item.qty - 1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </motion.button>

            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.qty}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="text-white text-sm font-bold w-4 text-center"
              >
                {item.qty}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.75 }}
              onClick={() => updateQty(item.id, item.qty + 1)}
              disabled={item.qty >= item.stock}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Line price */}
          <span className="text-white font-bold text-sm">
            <AnimatedPrice value={item.price * item.qty} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Shimmer Checkout Button ────────────────────────────────────────────────

const CheckoutButton = () => {
  const [state, setState] = useState<'idle' | 'loading'>('idle');
  const navigate = useNavigate();
  const { closeCart } = useCartStore();

  const handleClick = () => {
    if (state !== 'idle') return;
    setState('loading');
    setTimeout(() => {
      setState('idle');
      closeCart();
      navigate('/checkout');
    }, 1000);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      className="relative w-full h-14 bg-purple-600 rounded-2xl font-bold text-white overflow-hidden flex items-center justify-center gap-2 hover:bg-purple-500 transition-colors"
    >
      {/* Shimmer overlay during loading */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === 'idle' ? (
          <motion.span
            key="idle"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            Checkout <ArrowRight className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-white/80"
          >
            Redirecting to payment…
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ── Cart Drawer ────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { isOpen, closeCart, items, total, count } = useCartStore();
  const cartTotal = total();
  const cartCount = count();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.9 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[90] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-black text-lg tracking-tight">Your Cart</h2>
                {cartCount > 0 && (
                  <motion.span
                    layout
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <motion.button
                onClick={closeCart}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="text-zinc-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Items list / Empty state */}
            <div className="flex-1 overflow-y-auto px-6 overscroll-contain">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ShoppingBag className="w-16 h-16 text-zinc-800" />
                    </motion.div>
                    <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                    <motion.button
                      onClick={closeCart}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-purple-400 text-sm font-bold border border-purple-400/30 px-6 py-2 rounded-full hover:bg-purple-400/10 transition-colors"
                    >
                      Continue Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="list" layout>
                    {items.map((item, i) => (
                      <CartItemRow key={item.id} item={item} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer: Summary + Checkout */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  key="footer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 px-6 py-6 border-t border-zinc-800 bg-zinc-950"
                >
                  {/* Order summary */}
                  <div className="flex flex-col gap-2 mb-5 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                      <AnimatedPrice value={cartTotal} />
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span className="text-emerald-400 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-white font-black text-base pt-3 border-t border-zinc-800">
                      <span>Total</span>
                      <AnimatedPrice value={cartTotal} />
                    </div>
                  </div>

                  <CheckoutButton />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
