import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send } from 'lucide-react';

const Confetti = () => {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {pieces.map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 150;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        const colors = ['#a855f7', '#3b82f6', '#ec4899', '#facc15', '#10b981', '#ffffff'];
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ 
              x, 
              y, 
              scale: Math.random() * 0.6 + 0.4,
              opacity: 0,
              rotate: Math.random() * 360
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-2 h-4 rounded-sm"
            style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
          />
        );
      })}
    </div>
  );
};

export default function CtaSection() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect on background image
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  // Scroll in-view trigger for headline
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: "-100px" });

  const headline = "Join the Revolution.";
  const chars = headline.split("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || formState !== 'idle') return;
    
    setFormState('loading');
    // Simulate network request
    setTimeout(() => {
      setFormState('success');
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormState('idle');
        setInputValue("");
      }, 3000);
    }, 1500);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black border-t border-white/10"
    >
      {/* Parallax Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 w-full h-[140%] -top-[20%] pointer-events-none"
      >
        <div className="absolute inset-0 bg-black/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80" 
          alt="Cyberpunk workspace" 
          className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Animated Headline - Character Splitting */}
        <h2 
          ref={textRef}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 flex flex-wrap justify-center"
        >
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.8,
                type: "spring",
                bounce: 0.4,
                delay: i * 0.05
              }}
              className="inline-block"
              style={{ display: char === " " ? "inline" : "inline-block" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-gray-300 text-lg md:text-xl mb-12 max-w-lg"
        >
          Sign up for early access, exclusive drops, and insider-only pricing. No spam, ever.
        </motion.p>

        {/* Floating Label Input Form */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
          onSubmit={handleSubmit}
          className="relative w-full max-w-md flex items-center shadow-2xl"
        >
          <div className="relative flex-1">
            <input 
              type="email"
              id="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="peer w-full bg-zinc-900/90 backdrop-blur-md text-white border-2 border-zinc-800 rounded-l-full px-6 py-4 outline-none transition-colors focus:border-purple-500 shadow-inner"
              required
            />
            <motion.label 
              htmlFor="email"
              initial={false}
              animate={{
                top: isFocused || inputValue ? "-12px" : "50%",
                left: isFocused || inputValue ? "24px" : "24px",
                scale: isFocused || inputValue ? 0.85 : 1,
                y: isFocused || inputValue ? 0 : "-50%",
                color: isFocused ? "#a855f7" : "#9ca3af"
              }}
              className="absolute pointer-events-none bg-zinc-950 px-2 rounded-full font-medium"
            >
              Email address
            </motion.label>
          </div>

          <button 
            type="submit"
            disabled={formState !== 'idle'}
            className="relative h-[60px] w-24 bg-purple-600 rounded-r-full flex items-center justify-center border-2 border-purple-600 hover:bg-purple-500 transition-colors cursor-pointer disabled:cursor-default"
          >
            {/* Button Content Morphing */}
            <AnimatePresence mode="wait">
              {formState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-5 h-5 text-white ml-[-2px]" />
                </motion.div>
              )}
              {formState === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </motion.div>
              )}
              {formState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check className="w-6 h-6 text-white font-black" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Confetti Burst */}
            {formState === 'success' && <Confetti />}
          </button>
        </motion.form>

      </div>
    </section>
  );
}
