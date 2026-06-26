import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

// Headline component with word-by-word stagger
const StaggeredHeadline = ({ text }: { text: string }) => {
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
    <motion.h1
      className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6"
      variants={container}
      initial="hidden"
      animate="visible"
      custom={1}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default function Hero() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: [0, -20, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      }
    });
  }, [controls]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Animated Gradient Mesh Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-pink-500/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between h-full">
        
        {/* Left Side: Text */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center pt-20 lg:pt-0">
          <StaggeredHeadline text="Future of Commerce is Here." />
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed"
          >
            Experience lightning-fast checkout, immersive product views, and seamless payment integration. Built for the modern web.
          </motion.p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 20 }}
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Shop Collection
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 20 }}
              className="px-8 py-4 bg-transparent border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Learn More
            </motion.button>
          </div>
        </div>

        {/* Right Side: 3D Mockup Simulation */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center mt-10 lg:mt-0 relative perspective-1000">
          <motion.div
            animate={controls}
            className="relative w-full max-w-md aspect-square flex flex-col justify-center items-center"
          >
            {/* Glossy futuristic card simulating a 3D product or device */}
            <div className="w-64 h-96 md:w-80 md:h-[30rem] rounded-[2.5rem] bg-gradient-to-tr from-gray-900 via-gray-800 to-black border border-gray-700 shadow-2xl overflow-hidden relative group">
              {/* Screen Content */}
              <div className="absolute inset-2 rounded-[2rem] bg-black overflow-hidden flex flex-col justify-between p-6">
                <div className="w-full flex justify-between items-center text-white/50 text-sm">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white/50 rounded-full" />
                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 blur-md opacity-80"
                  />
                  <h3 className="mt-8 text-2xl font-bold text-white text-center tracking-wide">Flashcore</h3>
                  <p className="text-gray-400 text-center text-sm mt-2">Next-Gen Storefront</p>
                </div>
              </div>
              
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-white/10 to-transparent rotate-45 transform pointer-events-none group-hover:translate-y-10 transition-transform duration-700" />
            </div>
            
            {/* Dynamic Shadow */}
            <motion.div 
              animate={{ 
                scale: [1, 0.8, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="absolute -bottom-10 w-48 h-8 bg-black rounded-full blur-xl z-[-1]"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
