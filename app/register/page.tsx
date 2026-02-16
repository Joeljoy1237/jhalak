"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { categories, EventItem, TeamRegistration } from "@/data/constant";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Save } from "lucide-react";
import EventRegistrationCard from "@/components/EventRegistrationCard";
import { fetchUserRegistrations, updateUserSoloRegistrations, createTeam, leaveTeam, validateRegistrationRules } from "@/lib/registrationService";
import { motion, AnimatePresence } from "framer-motion";

// Helper to calculate usage
const getCounts = (soloEvents: string[], teamEvents: TeamRegistration[]) => {
    let counts = { offStage: 0, onStageInd: 0, onStageGroup: 0 };
    const allItems = categories.flatMap(c => c.items);
    
    // Helper to process a single title
    const process = (title: string) => {
         const ev = allItems.find(i => i.title === title);
         if (!ev) return;
         
         if (ev.categoryType === 'off_stage') {
             counts.offStage++;
         } else if (ev.categoryType === 'on_stage' || ev.categoryType === 'flagship') {
             if (ev.eventType === 'individual') {
                 counts.onStageInd++;
             } else {
                 // Group (On-Stage or Flagship)
                 counts.onStageGroup++;
             }
         }
    };
    
    soloEvents.forEach(process);
    teamEvents.forEach(t => process(t.eventTitle));
    return counts;
};

export default function RegisterPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Server State
    const [registrations, setRegistrations] = useState<{
        soloEvents: string[];
        teamEvents: TeamRegistration[];
        totalCount: number;
    }>({ soloEvents: [], teamEvents: [], totalCount: 0 });

    // Local State (Deferred Updates)
    const [pendingSoloEvents, setPendingSoloEvents] = useState<string[]>([]);
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Initial Auth & Data Fetch
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login"); // Or home if login modal
                return;
            }
            setUser(currentUser);
            
            // Fetch Registrations
            const data = await fetchUserRegistrations(currentUser.uid);
            setRegistrations(data);
            setPendingSoloEvents(data.soloEvents); // Sync local state
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, refreshTrigger]);

    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    // Compute derived state locally based on pending changes
    // const currentTotalCount = pendingSoloEvents.length + registrations.teamEvents.length; // Deprecated
    const counts = getCounts(pendingSoloEvents, registrations.teamEvents);
    
    const hasChanges = JSON.stringify(pendingSoloEvents.sort()) !== JSON.stringify(registrations.soloEvents.sort());

    const handleToggleSolo = (event: EventItem) => {
        const isSelected = pendingSoloEvents.includes(event.title);
        let newEvents;
        
        if (isSelected) {
            newEvents = pendingSoloEvents.filter(t => t !== event.title);
        } else {
            // Check Limits using validator
            const validation = validateRegistrationRules(registrations.soloEvents, registrations.teamEvents, [...pendingSoloEvents, event.title], undefined);
            
            if (!validation.valid) {
                 alert(validation.message);
                 return;
            }
            newEvents = [...pendingSoloEvents, event.title];
        }
        setPendingSoloEvents(newEvents);
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setSaving(true);
        const result = await updateUserSoloRegistrations(user.uid, pendingSoloEvents);
        if (result.success) {
            refreshData(); // Re-fetch to sync everything
        } else {
            alert(result.message);
        }
        setSaving(false);
    };

    const handleCreateTeam = async (event: EventItem, members: any[]) => {
        if (!user) return;
        
        if (hasChanges) {
             alert("Please save your pending solo event changes first.");
             return;
        }

        setActionLoading(event.title);
        
        // Validate Limits before calling service
        const validation = validateRegistrationRules(registrations.soloEvents, registrations.teamEvents, null, event.title);
        if (!validation.valid) {
             alert(validation.message);
             setActionLoading(null);
             return;
        }

        const fullTeam = [
            { 
                uid: user.uid, 
                name: user.displayName || "Leader", 
                email: user.email || "", 
                role: "leader", 
                status: "confirmed" 
            },
            ...members.map(m => ({
                uid: m.uid,
                name: m.name,
                email: m.email,
                role: "member",
                status: "confirmed" 
            }))
        ];

        const result = await createTeam(user.uid, user.displayName || "User", user.email || "", event.title, fullTeam as any);
        if (result.success) {
            refreshData();
        } else {
            alert(result.message);
        }
        setActionLoading(null);
    };

    const handleLeaveTeam = async (teamId: string) => {
        if (!user) return;
        if (confirm("Are you sure you want to leave/disband this team?")) {
            const result = await leaveTeam(user.uid, teamId);
            if (result.success) {
                refreshData();
            } else {
                alert(result.message);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#050505] text-white font-outfit relative overflow-y-auto">
            <Navbar />
            
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-900/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-[#BA170D]/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto mt-24 px-4 pb-20 relative z-10">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors mb-8 group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#FFD700]/10 border border-white/10 group-hover:border-[#FFD700]/50 transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back</span>
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black font-unbounded text-white mb-4">
                        EVENT REGISTRATION
                    </h1>
                    
                    {/* Updated Status Display with 3 counters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Off-Stage</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${counts.offStage > 4 ? "text-red-500" : "text-[#FFD700]"}`}>
                                {counts.offStage}
                                </span>
                                <span className="text-gray-500">/ 4</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">On-Stage (Ind)</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${counts.onStageInd > 3 ? "text-red-500" : "text-[#FFD700]"}`}>
                                {counts.onStageInd}
                                </span>
                                <span className="text-gray-500">/ 3</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
                            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Group</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${counts.onStageGroup > 2 ? "text-red-500" : "text-[#FFD700]"}`}>
                                {counts.onStageGroup}
                                </span>
                                <span className="text-gray-500">/ 2</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="space-y-16">
                    {categories.filter(cat => cat.title !== "Flagship Event").map((cat) => (
                        <section key={cat.title}>
                            <h2 className="text-2xl font-bold font-unbounded text-[#FFD700] mb-8 flex items-center gap-4">
                                {cat.title}
                                <div className="h-px flex-1 bg-white/10"></div>
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cat.items.map((event) => {
                                    // Check local pending state
                                    const isSoloRegistered = pendingSoloEvents.includes(event.title);
                                    
                                    // Check if registered as Team (server state)
                                    const teamReg = registrations.teamEvents.find(t => t.eventTitle === event.title);
                                    
                                    const isSelected = isSoloRegistered || !!teamReg;
                                    const isLocked = !!teamReg && teamReg.leaderId !== user?.uid;

                                    return (
                                        <EventRegistrationCard 
                                            key={event.title}
                                            event={event}
                                            isSelected={isSelected}
                                            isLocked={isLocked}
                                            teamDetails={teamReg}
                                            onToggle={() => handleToggleSolo(event)} // Handles local state
                                            onCreateTeam={(members) => handleCreateTeam(event, members)}
                                            onLeaveTeam={async () => {
                                                if (teamReg?.id) await handleLeaveTeam(teamReg.id);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {/* Floating Save Button */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="bg-[#FFD700] text-black px-8 py-3 rounded-full font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save size={20} />
                            )}
                            Save Changes
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
