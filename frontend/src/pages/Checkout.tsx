import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, MapPin, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { Link, useNavigate } from 'react-router-dom';

// -- Mock Stripe Imports (To get UI working before real backend integration) --
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// We'd use a real key in production
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// ── Validation Schemas ────────────────────────────────────────────────────────

const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(4, "ZIP code is required"),
});
type ShippingData = z.infer<typeof shippingSchema>;

// ── Progress Indicator ────────────────────────────────────────────────────────

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Review', icon: Package },
];

const ProgressSteps = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="mb-12 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />
      <motion.div
        className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? '#9333ea' : '#27272a',
                  scale: isActive ? 1.1 : 1,
                  borderColor: isActive || isCompleted ? '#a855f7' : '#3f3f46',
                }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10"
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Forms ─────────────────────────────────────────────────────────────────────

const ShippingForm = ({ onNext }: { onNext: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useRHForm<ShippingData>({
    resolver: zodResolver(shippingSchema)
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Shipping Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">First Name</label>
          <input {...register('firstName')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
          {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Last Name</label>
          <input {...register('lastName')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
          {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Address</label>
        <input {...register('address')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
        {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">City</label>
          <input {...register('city')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
          {errors.city && <span className="text-red-500 text-xs mt-1">{errors.city.message}</span>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">ZIP Code</label>
          <input {...register('zip')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
          {errors.zip && <span className="text-red-500 text-xs mt-1">{errors.zip.message}</span>}
        </div>
      </div>
      
      <button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
        Continue to Payment <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
};

const PaymentForm = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    // Simulate payment processing since we are using a mock client secret
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Payment Method</h2>
      
      <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
        <PaymentElement options={{ 
            layout: 'tabs',
            style: {
                base: {
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': { color: '#71717a' },
                    iconColor: '#a855f7'
                },
                invalid: { color: '#ef4444', iconColor: '#ef4444' }
            }
        }} />
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="px-6 py-4 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
          Back
        </button>
        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Check className="w-5 h-5" /> {/* Use spinner here ideally */}
            </motion.div>
          ) : (
            <>Pay Now <Check className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </form>
  );
};

const SuccessStep = () => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  React.useEffect(() => {
    // Fire confetti!
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#3b82f6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]"
      >
        <Check className="w-12 h-12 text-white" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-white"
      >
        Order Confirmed!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 max-w-md"
      >
        Your order #ORD-10924 has been successfully placed. We'll send you an email with tracking details shortly.
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/products')}
        className="mt-8 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
      >
        Continue Shopping
      </motion.button>
    </div>
  );
};

// ── Main Layout ───────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

export default function Checkout() {
  const { items, total } = useCartStore();
  const [[step, direction], setStep] = useState([1, 0]);

  const paginate = (newDirection: number) => {
    setStep([step + newDirection, newDirection]);
  };

  // Prevent checkout if cart is empty and not on success
  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-24 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-purple-400 hover:text-purple-300 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 text-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Checkout Area */}
        <div className="lg:col-span-7">
          <ProgressSteps currentStep={step} />
          
          <div className="relative min-h-[400px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                {step === 1 && <ShippingForm onNext={() => paginate(1)} />}
                
                {step === 2 && (
                  <Elements stripe={stripePromise} options={{ 
                      mode: 'payment', 
                      amount: Math.round(total() * 100) || 1000, 
                      currency: 'usd',
                      appearance: { theme: 'night' }
                  }}>
                    <PaymentForm onNext={() => paginate(1)} onBack={() => paginate(-1)} />
                  </Elements>
                )}
                
                {step === 3 && <SuccessStep />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Sticky Order Summary Sidebar */}
        {step !== 3 && (
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-6 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-zinc-800">
                  <span>Total</span>
                  <span>${total().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
