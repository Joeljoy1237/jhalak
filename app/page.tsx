"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventsGrid from "@/components/EventsGrid";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  useEffect(() => {
    // Check if loading screen was shown recently (5 mins)
    const lastSeen = localStorage.getItem("jhalak_loading_seen");
    const now = Date.now();
    
    if (lastSeen && (now - parseInt(lastSeen) < 5 * 60 * 1000)) {
        setIsLoading(false);
        setShouldShowLoader(false);
    } else {
        // If not seen recently, we will show the loader and update timestamp on completion
        setShouldShowLoader(true);
    }
  }, []);

  // Prevent scrolling when loading
  useEffect(() => {
    if (isLoading && shouldShowLoader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isLoading, shouldShowLoader]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    localStorage.setItem("jhalak_loading_seen", Date.now().toString());
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {!shouldShowLoader && !isLoading ? null : (
        <AnimatePresence mode="wait">
            {isLoading && shouldShowLoader && (
                <LoadingScreen key="loader" onComplete={handleLoadingComplete} />
            )}
        </AnimatePresence>
      )}

      <Navbar />
      <Hero startAnimation={!isLoading} />
      <EventsGrid />
    </main>
  );
}
