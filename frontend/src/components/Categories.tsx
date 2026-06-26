import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CATEGORIES = [
  { id: 'sneakers', name: 'Sneakers', bg: 'bg-orange-600', colorCode: '#ea580c', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', description: 'Step up your game with our exclusive kicks.' },
  { id: 'outerwear', name: 'Outerwear', bg: 'bg-blue-600', colorCode: '#2563eb', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', description: 'Stay warm and stylish with premium jackets.' },
  { id: 'accessories', name: 'Accessories', bg: 'bg-pink-600', colorCode: '#db2777', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', description: 'The perfect finishing touches to any outfit.' },
  { id: 'tech', name: 'Tech', bg: 'bg-emerald-600', colorCode: '#059669', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', description: 'Next-gen gadgets for the modern lifestyle.' },
  { id: 'fitness', name: 'Fitness', bg: 'bg-purple-600', colorCode: '#9333ea', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', description: 'Gear designed for peak performance.' },
];

export default function Categories() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Track the width for drag constraints to ensure we can drag exactly to the end
  useEffect(() => {
    if (carouselRef.current && containerRef.current) {
      setCarouselWidth(carouselRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  const activeCategory = CATEGORIES.find(c => c.id === activeId) || CATEGORIES[0];

  return (
    <section className="relative py-24 min-h-[80vh] flex flex-col justify-center overflow-hidden bg-black">
      
      {/* Background Color Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${activeCategory.colorCode}22 0%, #000000 60%)` 
          }}
        />
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col h-full">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Shop by Category</h2>
        <p className="text-gray-400 mb-12">Swipe through our collections to find your perfect fit.</p>

        {/* Draggable Row Container */}
        <div className="relative w-full overflow-hidden" ref={containerRef}>
          <motion.div 
            ref={carouselRef}
            drag="x"
            dragConstraints={{ right: 0, left: -carouselWidth }}
            whileTap={{ cursor: "grabbing" }}
            className="flex gap-6 pb-8 cursor-grab w-max"
          >
            {CATEGORIES.map((category) => (
              <motion.div
                layoutId={`card-${category.id}`}
                key={category.id}
                onClick={() => setActiveId(category.id)}
                className="relative overflow-hidden rounded-[2rem] w-72 h-[26rem] group shadow-xl shrink-0"
                style={{
                  // Hide the card in the list when it's expanded in the modal
                  opacity: activeId === category.id ? 0 : 1
                }}
              >
                <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                  <p className="text-gray-300 text-sm flex items-center gap-2">Explore <span className="group-hover:translate-x-1 transition-transform">→</span></p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Expanded Active Card */}
      <AnimatePresence>
        {activeId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* Expanded Card */}
            <motion.div
              layoutId={`card-${activeId}`}
              className="relative w-full max-w-5xl h-[80vh] bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveId(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side: Image */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
                <img src={CATEGORIES.find(c => c.id === activeId)?.image} alt="Expanded Category" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              
              {/* Right Side: Content */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-14 flex flex-col justify-center bg-zinc-900 relative">
                
                {/* Accent glow behind text matching category color */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: CATEGORIES.find(c => c.id === activeId)?.colorCode }}
                />

                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter"
                >
                  {CATEGORIES.find(c => c.id === activeId)?.name}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed max-w-md"
                >
                  {CATEGORIES.find(c => c.id === activeId)?.description}
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`w-fit px-10 py-5 ${CATEGORIES.find(c => c.id === activeId)?.bg} text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg`}
                >
                  Shop {CATEGORIES.find(c => c.id === activeId)?.name}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
