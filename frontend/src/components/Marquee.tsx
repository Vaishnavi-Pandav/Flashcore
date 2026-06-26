import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  { text: "Fastest checkout I've ever seen.", author: "Sarah J." },
  { text: "The UI is incredibly smooth and responsive.", author: "Mike T." },
  { text: "Love the floating 3D product previews!", author: "Elena R." },
  { text: "Checkout was a breeze with Stripe integration.", author: "David C." },
  { text: "Best e-commerce experience to date.", author: "Anna W." },
];

export default function Marquee() {
  return (
    <section className="py-16 bg-black overflow-hidden border-y border-white/10 relative flex items-center">
      
      {/* Left/Right Fade Out Gradients to hide the hard edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* 
        We animate x from 0 to -50%. Because we duplicate the content array, 
        -50% exactly aligns the start of the second array with the start of the screen,
        creating a seamless infinite loop.
      */}
      <motion.div
        className="flex w-max gap-6 px-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25,
        }}
        // Using whileHover to pause the WAAPI/CSS animation state as requested
        whileHover={{ animationPlayState: "paused" } as any}
      >
        {/* Render the array TWICE side-by-side */}
        {[...REVIEWS, ...REVIEWS].map((review, idx) => (
          <div 
            key={idx}
            className="flex-shrink-0 w-72 md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <div className="flex text-purple-400 mb-3 gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 text-base md:text-lg font-medium mb-4">"{review.text}"</p>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">— {review.author}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
