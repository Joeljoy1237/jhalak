"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { categories, EventItem } from "@/data/constant";
import { slugify } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Clock, Users, ScrollText, Trophy, LayoutGrid, Tag } from "lucide-react";

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use() - standard in Next.js 15+
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find event by slug
    // Cast to any to avoid strict union type mismatches between different event categories
    const allItems: EventItem[] = categories.flatMap((cat) => cat.items);
    const foundEvent = allItems.find((item) => slugify(item.title) === slug);

    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      // Keep event null if not found
      setEvent(null);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
     return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-unbounded">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm tracking-widest uppercase text-gray-500">Loading Event Details...</p>
            </div>
        </div>
     );
  }

  if (!event) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4">
             <Navbar />
             <div className="text-center space-y-4 max-w-md">
                 <h1 className="text-4xl font-black font-unbounded text-[#FFD700]">EVENT NOT FOUND</h1>
                 <p className="text-gray-400">
                    The event you are looking for might have been removed or the link is incorrect.
                 </p>
                 <Link href="/" className="inline-block px-8 py-3 bg-white/10 border border-white/10 rounded-full hover:bg-white/20 transition-colors">
                    Back to Home
                 </Link>
             </div>
        </div>
      );
  }

  // Format Helper
  const formatCategory = (cat: string) => cat.replace("_", "-").toUpperCase();
  const formatType = (type: string) => type.toUpperCase();

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#FFD700] selection:text-black font-outfit">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex flex-col justify-end w-full overflow-hidden">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0">
             {event.image ? (
                 <Image 
                    src={event.image} 
                    alt={event.title} 
                    fill 
                    priority
                    className="object-cover opacity-50" 
                 />
             ) : (
                 <div className={`w-full h-full bg-linear-to-br ${event.gradient || 'from-gray-900 to-black'} opacity-50`} />
             )}
             <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/60 to-transparent" />
         </div>

         <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto w-full">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
             >
                <Link href="/#events" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FFD700] mb-6 transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Lineup
                </Link>

                <div className="flex flex-wrap gap-3 mb-6">
                    {/* Category Type Badge */}
                    <span className="px-4 py-1.5 rounded-full bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">
                        {formatCategory(event.categoryType)}
                    </span>
                    {/* Tags */}
                    {event.tags?.map((tag: string) => (
                        <span key={tag} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider uppercase text-white/70">
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-unbounded text-white tracking-tighter mb-6 leading-none">
                    {event.title}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-8">
                    {event.description}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-4 md:gap-6 mt-8">
                    {/* Event Type (Individual/Group) */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 hover:border-[#FFD700]/30 transition-colors">
                        <LayoutGrid className="text-[#FFD700]" size={20} />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Event Type</p>
                            <p className="font-bold text-white leading-tight">{formatType(event.eventType)}</p>
                        </div>
                    </div>

                    {/* Time Limit */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 hover:border-[#FFD700]/30 transition-colors">
                        <Clock className="text-[#FFD700]" size={20} />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Time Limit</p>
                            <p className="font-bold text-white leading-tight">{event.timeLimit || "N/A"}</p>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 hover:border-[#FFD700]/30 transition-colors">
                        <Users className="text-[#FFD700]" size={20} />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Participants</p>
                            <p className="font-bold text-white leading-tight">
                                {event.minParticipants === null && event.maxParticipants === null 
                                  ? "Standard" 
                                  : event.minParticipants === event.maxParticipants 
                                    ? event.minParticipants 
                                    : `${event.minParticipants || 1} - ${event.maxParticipants || 'Unlimited'}`
                                }
                            </p>
                        </div>
                    </div>
                </div>

             </motion.div>
         </div>
      </div>

      {/* Details Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Rules & Info */}
          <div className="lg:col-span-2 space-y-12">
              
              {/* Rules and Regulations */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10"
              >
                  <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-[#FFD700]/10 rounded-xl">
                        <ScrollText className="text-[#FFD700]" size={28} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold font-unbounded">Rules & Regulations</h2>
                  </div>

                  <ul className="space-y-4">
                      {event.rules && event.rules.length > 0 ? (
                          event.rules.map((rule: string, i: number) => (
                              <li key={i} className="flex gap-4 text-gray-300 text-lg group">
                                  <span className="text-[#FFD700] font-mono mt-1 group-hover:scale-125 transition-transform">•</span>
                                  <span>{rule}</span>
                              </li>
                          ))
                      ) : (
                          <li className="text-gray-400 italic">No specific rules listed.</li>
                      )}
                  </ul>
              </motion.section>

          </div>

          {/* Right Column: Key Info & CTA */}
          <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-24 space-y-6"
              >
                  <div className="bg-linear-to-br from-[#FFD700]/10 to-transparent border border-[#FFD700]/20 rounded-3xl p-8 backdrop-blur-md">
                      <h3 className="text-xl font-bold font-unbounded mb-2 text-white">Ready to Perform?</h3>
                      <p className="text-gray-400 text-sm mb-8">Register now to secure your spot in {event.title}.</p>
                      
                      <Link href="/register" className="block w-full text-center py-4 bg-[#FFD700] text-black font-black uppercase tracking-wider rounded-xl hover:bg-[#FFC000] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all active:scale-95">
                          Register Now
                      </Link>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                       <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                           <Trophy className="text-[#FFD700]" size={20} />
                           <span>Prizes</span>
                       </h3>
                       <p className="text-gray-400 text-sm">
                           Attractive cash prizes and certificates for winners and runners-up.
                       </p>
                  </div>
              </motion.div>
          </div>

      </div>

    </main>
  );
}
