import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "Verified Buyer",
    content: "The attention to detail is just phenomenal. Not only does the product look amazing, but the checkout experience was the smoothest I've ever used. 10/10.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
  },
  {
    id: 2,
    name: "Samantha Lee",
    role: "Tech Enthusiast",
    content: "I was blown away by the 3D previews. Being able to see exactly what I was buying from every angle gave me so much confidence. Will be shopping here again!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
  },
  {
    id: 3,
    name: "Marcus Johnson",
    role: "Verified Buyer",
    content: "Customer service is top-notch. I had a question about sizing and they got back to me instantly. The quality of the actual product exceeded my expectations.",
    rating: 4,
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80"
  },
];

// Custom variants that accept 'direction' to know which way to slide
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 800 : -800,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 800 : -800,
    opacity: 0,
    scale: 0.8,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    }
  })
};

// Staggered star animation
const starContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const starVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -45 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300 } }
};

export default function Testimonials() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  // Wrap around index safely for negative values
  const wrapIndex = (index: number) => {
    const n = TESTIMONIALS.length;
    return ((index % n) + n) % n;
  };
  
  const imageIndex = wrapIndex(page);
  const currentTestimonial = TESTIMONIALS[imageIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [page, isHovered]);

  return (
    <section className="py-24 bg-zinc-950 text-white min-h-screen flex flex-col justify-center items-center overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 w-full relative">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">What They Say</h2>
          <p className="text-gray-400 text-lg">Don't just take our word for it.</p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative w-full h-[450px] sm:h-[400px] flex justify-center items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full max-w-2xl bg-zinc-900 border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col items-center text-center"
            >
              <Quote className="w-16 h-16 text-white/5 mb-6 absolute top-6 left-6" />
              
              <img 
                src={currentTestimonial.image} 
                alt={currentTestimonial.name} 
                className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              />

              {/* Animated Stars */}
              <motion.div 
                className="flex gap-1 mb-6 text-purple-400"
                variants={starContainerVariants}
                initial="hidden"
                animate="show"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={i} variants={starVariants}>
                    <Star 
                      className={`w-5 h-5 ${i < currentTestimonial.rating ? 'fill-current' : 'text-gray-700'}`} 
                    />
                  </motion.div>
                ))}
              </motion.div>

              <p className="text-xl md:text-2xl font-medium text-gray-200 mb-8 leading-relaxed">
                "{currentTestimonial.content}"
              </p>

              <div>
                <h4 className="font-bold text-white text-lg">{currentTestimonial.name}</h4>
                <p className="text-gray-500 text-sm uppercase tracking-widest mt-1">{currentTestimonial.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button 
            onClick={() => paginate(-1)}
            className="absolute left-0 md:left-4 z-10 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full flex justify-center items-center transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => paginate(1)}
            className="absolute right-0 md:right-4 z-10 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full flex justify-center items-center transition-colors shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dot Indicators with layoutId */}
        <div className="flex justify-center gap-4 mt-8 md:mt-12">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newDirection = idx > imageIndex ? 1 : -1;
                // Update page by calculating distance to the clicked dot
                setPage([page + (idx - imageIndex), newDirection]);
              }}
              className="relative w-3 h-3 rounded-full bg-white/20 transition-colors hover:bg-white/40 flex items-center justify-center"
            >
              {imageIndex === idx && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute -inset-1 bg-purple-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
