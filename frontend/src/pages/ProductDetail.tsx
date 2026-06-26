import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { fetchProductBySlug, type Review } from '../lib/api';

// ── Image Gallery ──────────────────────────────────────────────────────────

const ImageGallery = ({ images, productId }: { images: string[]; productId: string }) => {
  const [[activeIdx, direction], setActive] = useState([0, 0]);
  const dragStartX = useRef(0);

  const paginate = (dir: number) => {
    setActive(([prev]) => {
      const next = (prev + dir + images.length) % images.length;
      return [next, dir];
    });
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0, scale: 0.92, transition: { duration: 0.25 } }),
  };

  const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  const imgs = images?.length ? images : [FALLBACK];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-zinc-900 select-none">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.img
            layoutId={`product-image-${productId}`}
            key={activeIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            src={imgs[activeIdx]}
            alt="product"
            className="absolute inset-0 w-full h-full object-cover object-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={(_, info) => { dragStartX.current = info.point.x; }}
            onDragEnd={(_, info) => {
              const diff = info.point.x - dragStartX.current;
              if (Math.abs(diff) > 60) paginate(diff < 0 ? 1 : -1);
            }}
            whileDrag={{ scale: 1.03 }}
          />
        </AnimatePresence>

        {/* Arrows */}
        {imgs.length > 1 && (
          <>
            <button onClick={() => paginate(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => paginate(1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot pips */}
        {imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setActive([i, i > activeIdx ? 1 : -1])}>
                <motion.div
                  animate={{ width: i === activeIdx ? 20 : 6, backgroundColor: i === activeIdx ? '#a855f7' : '#6b7280' }}
                  className="h-1.5 rounded-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div className="flex gap-3">
          {imgs.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => setActive([i, i > activeIdx ? 1 : -1])}
              className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
              {i === activeIdx && (
                <motion.div layoutId="thumb-ring" className="absolute inset-0 ring-2 ring-purple-500 rounded-xl pointer-events-none" />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Quantity Selector ────────────────────────────────────────────────────────

const QuantitySelector = ({ qty, setQty, max }: { qty: number; setQty: (n: number) => void; max: number }) => (
  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 w-fit">
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={() => setQty(Math.max(1, qty - 1))}
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Minus className="w-5 h-5" />
    </motion.button>
    <AnimatePresence mode="popLayout">
      <motion.span
        key={qty}
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="text-white font-bold text-xl w-6 text-center"
      >
        {qty}
      </motion.span>
    </AnimatePresence>
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={() => setQty(Math.min(max, qty + 1))}
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Plus className="w-5 h-5" />
    </motion.button>
  </div>
);

// ── Reviews ──────────────────────────────────────────────────────────────────

const StarBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3" ref={ref}>
      <span className="text-gray-400 text-sm w-4">{rating}</span>
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current flex-shrink-0" />
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.9, delay: (5 - rating) * 0.1, ease: 'easeOut' }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
      <span className="text-gray-500 text-xs w-4">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="border-b border-zinc-800 pb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />
        ))}
      </div>
      <p className="text-gray-300 mb-3 leading-relaxed">{review.body}</p>
      <p className="text-gray-600 text-xs uppercase tracking-widest">
        Verified Buyer · {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
      </p>
    </motion.div>
  );
};

const REVIEWS_PER_PAGE = 5;

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const visible = reviews.slice(page * REVIEWS_PER_PAGE, (page + 1) * REVIEWS_PER_PAGE);

  // Distribution
  const dist = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: reviews.filter((v) => v.rating === r).length }));
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '–';

  return (
    <section className="mt-20 border-t border-zinc-800 pt-12">
      <h2 className="text-2xl font-black text-white mb-8">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet. Be the first!</p>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="flex flex-col sm:flex-row gap-8 mb-10">
            <div className="text-center flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-white">{avgRating}</span>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {dist.map((d) => <StarBar key={d.rating} rating={d.rating} count={d.count} total={reviews.length} />)}
            </div>
          </div>

          {/* Review Cards */}
          <div className="flex flex-col gap-6">
            {visible.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                >
                  {page === i && (
                    <motion.div layoutId="review-page-dot" className="absolute inset-0 bg-purple-600 rounded-full" />
                  )}
                  <span className={`relative z-10 ${page === i ? 'text-white' : 'text-gray-500'}`}>{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ── Add to Cart Button ───────────────────────────────────────────────────────

type CartState = 'idle' | 'adding' | 'added';

const AddToCartButton = ({ stock }: { stock: number }) => {
  const [state, setState] = useState<CartState>('idle');

  const handleClick = () => {
    if (state !== 'idle' || stock === 0) return;
    setState('adding');
    setTimeout(() => setState('added'), 1000);
    setTimeout(() => setState('idle'), 3000);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state !== 'idle' || stock === 0}
      className={`relative h-14 rounded-2xl font-bold text-base overflow-hidden flex items-center justify-center gap-3 px-8 w-full sm:w-auto sm:min-w-[220px] transition-colors ${
        stock === 0 ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' :
        state === 'added' ? 'bg-emerald-600 text-white' :
        'bg-purple-600 hover:bg-purple-500 text-white'
      }`}
      whileTap={state === 'idle' ? { scale: 0.96 } : {}}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.span key="idle" className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ShoppingCart className="w-5 h-5" />
            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.span>
        )}
        {state === 'adding' && (
          <motion.span key="adding" className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            Adding…
          </motion.span>
        )}
        {state === 'added' && (
          <motion.span key="added" className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            exit={{ opacity: 0 }}>
            ✓ Added to Cart
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return (
    <div className="min-h-screen bg-black pt-28 flex items-center justify-center">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            className="w-3 h-3 bg-purple-500 rounded-full" />
        ))}
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="min-h-screen bg-black pt-28 flex flex-col items-center justify-center gap-6">
      <p className="text-gray-400 text-xl">Product not found.</p>
      <button onClick={() => navigate('/products')} className="text-purple-400 underline">Back to Shop</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-10">
          <Link to="/products" className="flex items-center gap-1 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Shop
          </Link>
          <span>/</span>
          <span className="text-purple-400">{product.category?.name}</span>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Content: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Gallery */}
          <ImageGallery images={product.images} productId={product.id} />

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">{product.category?.name}</p>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">{product.name}</h1>

            {/* Rating Summary */}
            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const avg = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
                    return <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />;
                  })}
                </div>
                <span className="text-gray-400 text-sm">({product.reviews.length} reviews)</span>
              </div>
            )}

            <div className="text-3xl font-black text-white mb-6">${Number(product.price).toFixed(2)}</div>

            <p className="text-gray-400 leading-relaxed mb-8">{product.description ?? 'Premium quality product crafted for the modern lifestyle.'}</p>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-gray-400 text-sm">
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <QuantitySelector qty={qty} setQty={setQty} max={product.stock} />
              <AddToCartButton stock={product.stock} />
            </div>

            {/* Meta */}
            <div className="border-t border-zinc-800 pt-6 flex flex-col gap-3 text-sm text-gray-500">
              <p><span className="text-gray-400 font-medium">SKU:</span> {product.id.substring(0, 8).toUpperCase()}</p>
              <p><span className="text-gray-400 font-medium">Category:</span> {product.category?.name}</p>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <ReviewsSection reviews={product.reviews ?? []} />
      </div>
    </div>
  );
}
