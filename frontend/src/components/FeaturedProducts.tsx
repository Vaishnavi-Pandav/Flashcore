import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { m, useInView } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const DUMMY_PRODUCTS = [
  { id: '1', name: 'Quantum X1 Sneaker', price: 199.99, category: 'Footwear', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80' },
  { id: '2', name: 'Aura Wireless Headphones', price: 249.00, category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { id: '3', name: 'Nebula Smartwatch', price: 329.50, category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { id: '4', name: 'Zenith Designer Backpack', price: 145.00, category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// ── Product Card (memoised – won't re-render unless product changes) ──────────
const ProductCard = memo(({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) => (
  <m.div 
    variants={cardVariants}
    whileHover={{ y: -10 }}
    className="group flex flex-col cursor-pointer relative"
  >
    <m.div 
      whileHover="hover"
      className="relative w-full aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_40px_rgba(147,51,234,0.2)] transition-shadow duration-500"
    >
      {/* Optimised: lazy loading + srcset for WebP */}
      <m.img 
        src={`${product.image}&fm=webp`}
        srcSet={`${product.image}&fm=webp&w=400 400w, ${product.image}&fm=webp&w=800 800w`}
        sizes="(max-width: 640px) 90vw, (max-width: 1280px) 25vw, 300px"
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700"
        variants={{ hover: { scale: 1.1 } }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <m.button
        variants={{ hover: { y: 0, opacity: 1 } }}
        initial={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => onAddToCart(product)}
        className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md text-black font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
      >
        <ShoppingBag className="w-5 h-5" />
        Quick Add
      </m.button>
    </m.div>

    <div className="px-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{product.category}</p>
      <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors">{product.name}</h3>
      <p className="text-lg font-medium text-gray-300">${product.price.toFixed(2)}</p>
    </div>
  </m.div>
));

// ── Skeleton Loader ───────────────────────────────────────────────────────────
const ProductSkeleton = memo(({ index }: { index: number }) => (
  <m.div variants={cardVariants} className="flex flex-col gap-4">
    <m.div 
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
      className="w-full aspect-[4/5] bg-zinc-800 rounded-3xl"
    />
    <div className="space-y-3 mt-2 px-2">
      {[1/3, 3/4, 1/4].map((w, i) => (
        <m.div 
          key={i}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
          className="h-4 bg-zinc-800 rounded-full"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  </m.div>
));

// ── Section ───────────────────────────────────────────────────────────────────
export default function FeaturedProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Memoised handler so ProductCard never re-renders due to new function reference
  const handleAddToCart = useCallback((product: any) => {
    console.log('Add to cart:', product.name);
  }, []);

  return (
    <section className="py-24 bg-zinc-950 text-white min-h-screen flex flex-col justify-center relative overflow-hidden" ref={ref}>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8">
          <m.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Trending Now</h2>
            <p className="text-gray-400 max-w-md text-lg">Discover our most sought-after pieces, hand-picked for the modern enthusiast.</p>
          </m.div>

          <m.button
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 md:mt-0 group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All Collection
            <m.span 
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              →
            </m.span>
          </m.button>
        </div>

        <m.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {isLoading 
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} index={i} />)
            : DUMMY_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))
          }
        </m.div>
        
      </div>
    </section>
  );
}
