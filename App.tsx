import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * HondAanZee - Under Construction Page
 * 
 * DYNAMIC UPDATES:
 * - Dynamic background slideshow (5 images).
 * - Smooth cross-fade transitions.
 * - Persistent parallax effect.
 * - Premium shimmer footer.
 */

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?q=80&w=2070&auto=format&fit=crop", // Australian Shepherd
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop", // Golden on Beach
  "https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=2070&auto=format&fit=crop", // Coastal Dunes
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2070&auto=format&fit=crop", // Jack Russell Beach
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2068&auto=format&fit=crop"  // Puppy on Beach
];

const TimerBox = ({ value, label, delay }: { value: number; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="flex flex-col items-center justify-center flex-1 min-w-0 p-2 py-3 md:p-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-[2.5rem] shadow-2xl"
  >
    <div className="flex items-center justify-center h-8 md:h-16">
      <span className="text-2xl md:text-6xl font-black text-amber-500 tabular-nums tracking-tighter drop-shadow-lg">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.3em] text-white/40 mt-1 md:mt-4 whitespace-nowrap">
      {label}
    </span>
  </motion.div>
);

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  
  // Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax movement
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map mouse position to movement range (+/- 25px for deeper feel)
  const bgX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [25, -25]);
  const bgY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [25, -25]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const targetTime = useMemo(() => {
    return Date.now() + 
      (1 * 24 * 60 * 60 * 1000) + 
      (23 * 60 * 60 * 1000) + 
      (59 * 60 * 1000) + 
      (59 * 1000);
  }, []);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const diff = targetTime - Date.now();
    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
      minutes: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
      seconds: Math.max(0, Math.floor((diff % (1000 * 60)) / 1000)),
    };
  });

  useEffect(() => {
    // Countdown Timer Interval
    const countdownInterval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdownInterval);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    // Background Rotation Interval
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000);

    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(bgInterval);
      clearTimeout(timer);
    };
  }, [targetTime]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden selection:bg-blue-500/30 text-white font-['Inter',_sans-serif]"
    >
      
      {/* Parallax Background Container */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className="absolute inset-[-10%] z-0"
      >
        <AnimatePresence mode="sync">
          <motion.div 
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat grayscale-[15%]"
              style={{ backgroundImage: `url(${BACKGROUND_IMAGES[bgIndex]})` }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Consistent Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-black/95" />
        <div className="absolute inset-0 bg-black/10 backdrop-contrast-[1.1]" />
      </motion.div>

      <AnimatePresence>
        {isLoaded && (
          <main className="relative z-10 w-full max-w-5xl px-4 py-8 md:py-16 text-center flex flex-col items-center justify-center gap-6 md:gap-10">
            
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20"
            >
              <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-white text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                🚀 Binnenkort online
              </span>
            </motion.div>

            {/* Premium Branding Section */}
            <div className="space-y-4 md:space-y-8 flex flex-col items-center">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl md:text-[10rem] font-black tracking-tighter leading-none select-none"
              >
                <span className="text-white drop-shadow-2xl">Hond</span>
                <span className="text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]">aan</span>
                <span className="text-white drop-shadow-2xl">Zee</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-base md:text-3xl font-light text-blue-100/80 tracking-[0.1em] max-w-2xl mx-auto italic"
              >
                "De ultieme gids voor honden aan de Belgische kust."
              </motion.p>
            </div>

            {/* Countdown Component */}
            <div className="flex flex-row gap-3 md:gap-6 w-full max-w-3xl justify-center">
              <TimerBox value={timeLeft.days} label="dag" delay={0.7} />
              <TimerBox value={timeLeft.hours} label="uur" delay={0.8} />
              <TimerBox value={timeLeft.minutes} label="min" delay={0.9} />
              <TimerBox value={timeLeft.seconds} label="sec" delay={1.0} />
            </div>

            {/* Explainer Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="max-w-xl bg-black/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <p className="relative text-gray-200 text-base md:text-2xl leading-relaxed font-normal text-center">
                We brengen de regels voor honden in <span className="text-blue-400 font-bold">alle 10 kustgemeenten</span> samen.<br className="hidden md:block" />
                Zo weet je straks in één oogopslag waar je hond welkom is aan zee.
              </p>
            </motion.div>

            {/* Social Connection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <a 
                href="https://www.facebook.com/webaanzee" 
                target="_blank" 
                className="group flex items-center gap-4 px-10 py-5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 backdrop-blur-3xl transition-all duration-300 shadow-xl hover:shadow-blue-500/10 active:scale-95"
              >
                <svg className="w-6 h-6 text-blue-400 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-white font-black tracking-[0.2em] uppercase text-xs md:text-sm">Blijf op de hoogte</span>
              </a>
            </motion.div>

          </main>
        )}
      </AnimatePresence>

      {/* Footer Branding - Webaanzee (no spaces) */}
      <footer className="fixed bottom-8 w-full flex justify-center px-6 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="backdrop-blur-3xl bg-black/40 border border-white/10 px-10 py-5 rounded-full flex flex-wrap items-center justify-center gap-4 md:gap-6 shadow-2xl"
        >
          <span className="text-white/40 text-[10px] md:text-xs font-medium tracking-wide">Concept & Development door</span>
          <a 
            href="https://www.webaanzee.be" 
            target="_blank" 
            className="font-black uppercase tracking-[0.25em] text-sm md:text-xl relative group inline-flex overflow-hidden"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                left: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none z-10"
            />

            <span className="text-white transition-colors group-hover:text-blue-200">Web</span>
            <span className="text-amber-500 group-hover:text-amber-400 transition-colors">aan</span>
            <span className="text-white transition-colors group-hover:text-blue-200">zee</span>
            
            {/* Hover Underline */}
            <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-500 rounded-full" />
          </a>
        </motion.div>
      </footer>
    </div>
  );
}