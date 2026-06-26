import React, { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { fetchProducts, fetchCategories, type Product, type Category } from '../lib/api';

const LIMIT = 12;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];
const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 – $150', min: 50, max: 150 },
  { label: '$150 – $300', min: 150, max: 300 },
  { label: '$300+', min: 300, max: undefined },
];

// ── Animation Variants ─────────────────────────────────────────────────────

const gridContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const drawerVariants = {
  hidden: { x: '-100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

// ── ProductCard ───────────────────────────────────────────────────────────

const ProductCard = ({ product }: { product: Product }) => (
  <motion.div variants={cardVariants} whileHover={{ y: -8 }} className="group flex flex-col cursor-pointer">
    <div className="relative w-full aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-[0_16px_40px_rgba(147,51,234,0.2)] transition-shadow duration-500">
      {product.images?.[0] ? (
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
          <span className="text-gray-600 text-sm">No Image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.button
        initial={{ y: 40, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        className="absolute bottom-3 left-3 right-3 bg-white text-black font-bold py-3 rounded-xl text-sm"
        whileTap={{ scale: 0.97 }}
      >
        Quick Add
      </motion.button>
    </div>
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">{product.category?.name}</p>
    <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors leading-tight">{product.name}</h3>
    <p className="text-gray-300 font-medium">${Number(product.price).toFixed(2)}</p>
  </motion.div>
);

// ── Skeleton Card ─────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="flex flex-col gap-4">
    <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.6, repeat: Infinity }}
      className="w-full aspect-[4/5] bg-zinc-800 rounded-2xl" />
    <div className="space-y-2 px-1">
      <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.6, repeat: Infinity }}
        className="h-3 w-1/4 bg-zinc-800 rounded-full" />
      <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.6, repeat: Infinity }}
        className="h-5 w-3/4 bg-zinc-800 rounded-full" />
      <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.6, repeat: Infinity }}
        className="h-4 w-1/5 bg-zinc-800 rounded-full" />
    </div>
  </div>
);

// ── Filter Sidebar Content ─────────────────────────────────────────────────

const FilterContent = ({
  categories, searchParams, setSearchParams, onClose,
}: {
  categories: Category[];
  searchParams: URLSearchParams;
  setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void;
  onClose?: () => void;
}) => {
  const activeCat = searchParams.get('category_id') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value !== undefined && value !== '') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSearchParams(() => new URLSearchParams());
    onClose?.();
  };

  const activeRange = PRICE_RANGES.find(r =>
    String(r.min ?? '') === minPrice && String(r.max ?? '') === maxPrice
  );

  return (
    <div className="flex flex-col gap-8 p-6 md:p-0">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-white text-lg">Filters</h3>
        <button onClick={clearAll} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Clear All</button>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Category</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setFilter('category_id', undefined)}
            className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!activeCat ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter('category_id', cat.id)}
              className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCat === cat.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Price Range</p>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range) => {
            const isActive = (String(range.min ?? '') === minPrice && String(range.max ?? '') === maxPrice)
              || (!range.min && !range.max && !minPrice && !maxPrice);
            return (
              <button
                key={range.label}
                onClick={() => {
                  setFilter('min_price', range.min !== undefined ? String(range.min) : undefined);
                  setFilter('max_price', range.max !== undefined ? String(range.max) : undefined);
                }}
                className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Products Page ─────────────────────────────────────────────────────────

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || undefined;
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const sortBy = (searchParams.get('sort_by') || 'newest') as 'newest' | 'price_asc' | 'price_desc';

  // Categories query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  // Infinite products query — re-fetch when any filter changes
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['products', search, categoryId, minPrice, maxPrice, sortBy],
    queryFn: ({ pageParam = 0 }) =>
      fetchProducts({ skip: pageParam, limit: LIMIT, search, category_id: categoryId, min_price: minPrice, max_price: maxPrice, sort_by: sortBy }),
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
  });

  const allProducts = data?.pages.flatMap((p) => p.items) ?? [];

  // Intersection Observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNext();
    }, { threshold: 0.1 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNext]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (e.target.value) next.set('search', e.target.value);
      else next.delete('search');
      return next;
    });
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort_by', e.target.value);
      return next;
    });
  };

  // Key changes when filters change to re-trigger stagger animation
  const gridKey = `${search}-${categoryId}-${minPrice}-${maxPrice}-${sortBy}`;

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Shop All</h1>
          <p className="text-gray-400">
            {isLoading ? 'Loading...' : `${data?.pages[0]?.total ?? 0} products`}
          </p>
        </div>

        {/* Search + Sort toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-5 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSort}
              className="appearance-none bg-zinc-900 border border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex md:hidden items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-white text-sm hover:border-purple-500 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-28 self-start">
            <FilterContent
              categories={categories}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={gridKey}
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {isLoading
                  ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)
                  : allProducts.map((p) => <ProductCard key={p.id} product={p} />)
                }
              </motion.div>
            </AnimatePresence>

            {/* Infinite Scroll Sentinel + Loading indicator */}
            <div ref={sentinelRef} className="mt-16 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  ))}
                </div>
              )}
              {!hasNextPage && !isLoading && allProducts.length > 0 && (
                <p className="text-gray-600 text-sm tracking-widest uppercase">You've reached the end</p>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />
            <motion.div
              variants={drawerVariants} initial="hidden" animate="show" exit="exit"
              className="fixed top-0 left-0 bottom-0 w-72 bg-zinc-950 border-r border-zinc-800 z-[70] overflow-y-auto"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterContent
                categories={categories}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onClose={() => setMobileFilterOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
