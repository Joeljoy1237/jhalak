"use client";

import { motion } from "framer-motion";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-900/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-[#BA170D]/10 blur-[100px] rounded-full"></div>
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10"
        >
           {/* Header Skeleton */}
           <div className="flex flex-col items-center mb-10 gap-4">
                <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse border-2 border-white/10" />
                <div className="h-8 w-64 bg-white/5 rounded-md animate-pulse" />
                <div className="h-4 w-48 bg-white/5 rounded-md animate-pulse" />
           </div>

           <div className="flex flex-col gap-8">
              {/* Name Field Skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>

              {/* Department Skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
              </div>

              {/* Semester Skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="h-16 w-full bg-white/5 rounded-xl animate-pulse mt-4" />
           </div>
        </motion.div>
    </div>
  );
}
