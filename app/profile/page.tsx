"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import { fetchUserRegistrations, UserRegistrations } from "@/lib/registrationService";
import { TeamRegistration } from "@/data/constant";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

const DEPARTMENTS = ["CIVIL", "MECH", "EEE", "CSE"];
const SEMESTERS = ["S2", "S4", "S6", "S8"];
const HOUSES = ["Red", "Blue", "Yellow"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [registrations, setRegistrations] = useState<UserRegistrations>({ soloEvents: [], teamEvents: [], totalCount: 0 });

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    semester: "",
    house: ""
  });

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/"); // Redirect home if not logged in
        return;
      }
      
      setUser(currentUser);
      
      try {
        if (db) {
            // 1. Fetch Profile
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
    
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setFormData({
                    name: userData.name || currentUser.displayName || "",
                    department: userData.department || "",
                    semester: userData.semester || "",
                    house: userData.house || ""
                });
            } else {
                 setFormData(prev => ({ ...prev, name: currentUser.displayName || "" }));
            }

            // 2. Fetch Registrations
            const regData = await fetchUserRegistrations(currentUser.uid);
            setRegistrations(regData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || !user) return;
    
    // Validate all fields are present
    if (!formData.name || !formData.department || !formData.semester || !formData.house) {
        alert("Please fill in all fields including House.");
        return;
    }

    setSaving(true);

    try {
      // 1. Update Auth Profile (Display Name)
      if (user.displayName !== formData.name) {
          await updateProfile(user, { displayName: formData.name });
      }

      // 2. Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: user.email,
        department: formData.department,
        semester: formData.semester,
        house: formData.house,
        photoURL: user.photoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // Merge to avoid overwriting other fields if any

      console.log("Profile updated successfully");
      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
      return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-outfit relative overflow-y-auto">
        <Navbar />
        
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-900/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-[#BA170D]/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24">
            
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors self-start group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#FFD700]/10 border border-white/10 group-hover:border-[#FFD700]/50 transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back</span>
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                    {/* Profile Form Section */}
                    <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-xl shadow-2xl flex-1"
                    >
                    <div className="flex flex-col items-center mb-10">
                            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-[#FFD700]">
                                {user?.photoURL ? (
                                    <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#FFD700]" />
                                )}
                            </div>
                            <h1 className="text-3xl font-black font-unbounded text-white text-center">YOUR PROFILE</h1>
                            <p className="text-gray-400 mt-2 text-center text-sm">
                                Update your details for event registration.
                            </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3 ml-1">Full Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-hidden transition-all placeholder:text-white/20"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3 ml-1">Department <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-3">
                                {DEPARTMENTS.map((dept) => (
                                    <button
                                        key={dept}
                                        type="button"
                                        onClick={() => setFormData({...formData, department: dept})}
                                        className={`p-4 rounded-xl border text-sm font-bold tracking-wide transition-all duration-300 ${
                                            formData.department === dept 
                                            ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-[1.02]" 
                                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/10"
                                        }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                            {!formData.department && <p className="text-red-500/50 text-xs mt-1 ml-1">Required</p>}
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="block text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3 ml-1">Semester <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-4 gap-3">
                                {SEMESTERS.map((sem) => (
                                    <button
                                        key={sem}
                                        type="button"
                                        onClick={() => setFormData({...formData, semester: sem})}
                                        className={`p-4 rounded-xl border text-sm font-bold tracking-wide transition-all duration-300 ${
                                            formData.semester === sem 
                                            ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-[1.02]" 
                                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/10"
                                        }`}
                                    >
                                        {sem}
                                    </button>
                                ))}
                            </div>
                            {!formData.semester && <p className="text-red-500/50 text-xs mt-1 ml-1">Required</p>}
                        </div>

                        {/* House */}
                        <div>
                            <label className="block text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3 ml-1">House <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-3">
                                {HOUSES.map((house) => {
                                    const isSelected = formData.house === house;
                                    let borderColor = "border-white/10";
                                    let activeClass = "";
                                    
                                    // Custom colors for each house
                                    if (house === "Red") {
                                        activeClass = isSelected ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "hover:text-red-500 hover:border-red-500/50";
                                    } else if (house === "Blue") {
                                        activeClass = isSelected ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "hover:text-blue-500 hover:border-blue-500/50";
                                    } else if (house === "Yellow") {
                                        activeClass = isSelected ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]" : "hover:text-yellow-400 hover:border-yellow-400/50";
                                    }

                                    return (
                                        <button
                                            key={house}
                                            type="button"
                                            onClick={() => setFormData({...formData, house: house})}
                                            className={`p-4 rounded-xl border text-sm font-bold tracking-wide transition-all duration-300 ${
                                                isSelected 
                                                ? `${activeClass} scale-[1.02]` 
                                                : `bg-white/5 text-gray-400 ${activeClass} hover:bg-white/10 border-white/10`
                                            }`}
                                        >
                                            {house}
                                        </button>
                                    );
                                })}
                            </div>
                            {!formData.house && <p className="text-red-500/50 text-xs mt-1 ml-1">Required</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            className="mt-4 bg-white text-black font-black font-unbounded text-lg py-4 rounded-xl hover:bg-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                            {saving ? "Saving..." : "Update Profile"}
                        </button>
                    </form>
                    </motion.div>

                    {/* Registrations Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-xl shadow-2xl flex-1 flex flex-col h-full self-stretch"
                    >
                        <h2 className="text-2xl font-black font-unbounded text-[#FFD700] mb-8 text-center uppercase tracking-wider">
                            Your Events
                        </h2>

                        <div className="flex-1 space-y-8 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            
                            {/* Solo Events */}
                            <div>
                                <h3 className="text-white/50 font-bold uppercase tracking-widest text-xs mb-4">Solo Events</h3>
                                {registrations.soloEvents.length === 0 ? (
                                    <p className="text-gray-500 italic text-sm">No solo events registered.</p>
                                ) : (
                                    <div className="grid gap-3">
                                        {registrations.soloEvents.map(event => (
                                            <div key={event} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-[#FFD700]/30 transition-colors">
                                                <span className="font-bold text-white group-hover:text-[#FFD700] transition-colors">{event}</span>
                                                <span className="text-xs px-2 py-1 rounded bg-[#FFD700]/20 text-[#FFD700] font-mono">SOLO</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Team Events */}
                            <div>
                                <h3 className="text-white/50 font-bold uppercase tracking-widest text-xs mb-4">Team Events</h3>
                                {registrations.teamEvents.length === 0 ? (
                                    <p className="text-gray-500 italic text-sm">No team events registered.</p>
                                ) : (
                                    <div className="grid gap-3">
                                        {registrations.teamEvents.map(team => (
                                            <div key={team.id} className="bg-white/5 border border-white/10 p-4 rounded-xl group hover:border-[#FFD700]/30 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-white group-hover:text-[#FFD700] transition-colors">{team.eventTitle}</span>
                                                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono">TEAM</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Role: <span className={team.leaderId === user?.uid ? "text-[#FFD700]" : "text-white"}>
                                                        {team.leaderId === user?.uid ? "Leader" : "Member"}
                                                    </span>
                                                </div>
                                                {team.teamName && (
                                                    <div className="text-xs text-gray-500 mt-1">Team: {team.teamName}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button 
                                onClick={() => router.push("/register")}
                                className="w-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-bold py-4 rounded-xl transition-all uppercase tracking-wider text-sm"
                            >
                                Manage Registrations
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    </div>
  );
}
