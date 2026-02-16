"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventsGrid from "@/components/EventsGrid";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Prevent scrolling when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isLoading]);

  return (
    <main className="bg-[#050505] min-h-screen text-white overflow-hidden selection:bg-[#FFD700] selection:text-black">
      <AnimatePresence mode="wait">
        {isLoading && (
            <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <Navbar />
      <Hero startAnimation={!isLoading} />
      <EventsGrid />
    </main>
  );
}
