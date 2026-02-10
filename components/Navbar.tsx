"use client"
import { motion, Variants, LayoutGroup } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  const navVariants: Variants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  return (
    <LayoutGroup>
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center shadow-2xl">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tighter shrink-0 hover:scale-105 transition-transform duration-300">
            <span className="text-white">JHALAK</span>
            <span className="text-[#BA170D]">.</span>
          </Link>

        </div>
      </motion.nav>
    </LayoutGroup>
  );
}
