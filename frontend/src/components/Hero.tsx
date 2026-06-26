import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { m, useAnimation } from 'framer-motion';

// Headline component with word-by-word stagger
// m.* components work inside LazyMotion<domAnimation>
const StaggeredHeadline = memo(({ text }: { text: string }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <m.div
      className="flex flex-wrap justify-center"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <m.span
          key={index}
          variants={child}
          className="mr-[0.3em] last:mr-0"
        >
          {word}
        </m.span>
      ))}
    </m.div>
  );
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/30 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-violet-800/20 blur-[80px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-800/20 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          New Season Collection Now Live
        </m.div>

        <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-6">
          <StaggeredHeadline text="The Future of" />
          <span className="block mt-2 bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            <StaggeredHeadline text="Shopping." />
          </span>
        </h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Experience a new era of e-commerce with blazing-fast performance,
          stunning animations, and a curated selection of premium products.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/products"
            className="w-full sm:w-auto group relative overflow-hidden bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]"
          >
            Shop Now
          </Link>
          <Link
            to="#featured"
            className="w-full sm:w-auto text-gray-300 hover:text-white border border-white/10 hover:border-white/30 font-medium px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            Explore Collection
          </Link>
        </m.div>
      </div>

      {/* Optimized hero image with lazy loading + srcset */}
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
        className="relative z-10 mt-16 w-full max-w-4xl mx-auto px-6"
      >
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-900 border border-white/10 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=75&fm=webp"
            srcSet="
              https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&q=75&fm=webp 640w,
              https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1024&q=75&fm=webp 1024w,
              https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=75&fm=webp 1920w
            "
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
            alt="Flashcore Shopping Experience"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      </m.div>
    </section>
  );
}
