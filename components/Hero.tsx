"use client";

import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  // Mouse move effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(textRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.5
      })
      .from(subTextRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.5");
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative h-dvh w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A] group"
    >
      
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(186, 23, 13, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Noise Texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#BA170D]/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('/ash_bg.png')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100px_100px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 md:px-24 flex flex-col md:flex-row items-center justify-between md:justify-center gap-0 md:gap-12 h-full">
        
        {/* Text Side */}
        <div className="flex-1 text-center md:text-left z-20 flex flex-col justify-center pt-20 md:pt-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-gray-400 font-medium tracking-wider text-xs md:text-sm mb-2 uppercase">
              Carmel College of Engineering and Technology presents
            </p>
            <p className="text-[#BA170D] font-mono tracking-widest text-base md:text-lg mb-4 uppercase">
              Under the event Jhalak
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Outlined Text Behind */}
            <h1 className="absolute top-0 left-0 text-7xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-linear-to-b from-white/10 to-transparent pointer-events-none select-none blur-sm transform translate-x-2 translate-y-2">
                AROHA
            </h1>
            <h1 ref={textRef} className="relative text-7xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-white mix-blend-difference mb-6 drop-shadow-[0_0_15px_rgba(186,23,13,0.5)]">
                AROHA
            </h1>
          </div>
          
          <p ref={subTextRef} className="text-xl md:text-2xl text-gray-400 max-w-lg mx-auto md:mx-0 font-light tracking-wide">
            <span className="text-[#BA170D]">"</span> Unleash the Rhythm Within <span className="text-[#BA170D]">"</span>
          </p>
        </div>

        {/* Image Side */}
        <div className="flex-none md:flex-1 relative h-[60vh] md:h-full w-full flex items-end justify-center md:pb-0">
             {/* Main Focus Image */}
             <motion.div
              initial={{ opacity: 0, y: 300, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
              className="relative z-20 w-full h-full"
             >
                <div className="absolute inset-0 flex items-end justify-center">
                    <Image 
                        src="/dance.png" 
                        alt="Dancer" 
                        width={700} 
                        height={900} 
                        className="object-contain object-top md:object-bottom drop-shadow-2xl h-full w-auto"
                        priority
                    />
                </div>
             </motion.div>

             {/* Floating Elements */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute top-1/4 right-10 w-16 h-16 md:w-24 md:h-24 border border-white/20 rounded-full z-10"
             />
             <motion.div 
               animate={{ y: [0, 30, 0] }}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-1/4 left-10 w-12 h-12 md:w-16 md:h-16 bg-[#BA170D]/20 rounded-full blur-xl z-10"
             />
        </div>
      </div>

        {/* Scroll Indicator */}
       <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
       >
         <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
         <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 1.5 }}
           className="w-1 h-8 md:h-12 bg-linear-to-b from-[#BA170D] to-transparent rounded-full"
         />
       </motion.div>
    </div>
  );
}
