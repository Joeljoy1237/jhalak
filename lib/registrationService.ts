import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc
} from "firebase/firestore";
import { TeamRegistration, SoloRegistration, TeamMember, categories } from "@/data/constant";

export interface UserRegistrations {
    soloEvents: string[]; // Event Titles
    teamEvents: TeamRegistration[];
    totalCount: number;
}

// Helper to get event details
const getEventDetails = (eventTitle: string) => {
    const allItems = categories.flatMap((cat) => cat.items);
    return allItems.find((item) => item.title === eventTitle);
};

// Helper to validate registration rules
export const validateRegistrationRules = (
    existingSoloEvents: string[],
    existingTeamEvents: TeamRegistration[],
    targetSoloEvents: string[] | null, // If null, use existing (for team creation context)
    newTeamEventTitle?: string // If null, no new team (for solo update context)
): { valid: boolean; message?: string } => {

    // Determine the final list of events to validate
    const finalSoloEvents = targetSoloEvents !== null ? targetSoloEvents : existingSoloEvents;
    const finalTeamEvents = existingTeamEvents.map(t => t.eventTitle);
    if (newTeamEventTitle) {
        finalTeamEvents.push(newTeamEventTitle);
    }

    let offStageCount = 0;
    let onStageIndCount = 0;
    let onStageGroupCount = 0;

    const processEvent = (title: string) => {
        const event = getEventDetails(title);
        if (!event) return;

        if (event.categoryType === 'off_stage') {
            offStageCount++;
        } else if (event.categoryType === 'on_stage' || event.categoryType === 'flagship') {
            if (event.eventType === 'individual') {
                onStageIndCount++;
            } else {
                // Group event (On-Stage or Flagship)
                onStageGroupCount++;
            }
        }
    };

    if (finalSoloEvents) finalSoloEvents.forEach(processEvent);
    finalTeamEvents.forEach(processEvent);

    if (offStageCount > 4) return { valid: false, message: `Maximum 4 Off-Stage events allowed. You have selected ${offStageCount}.` };
    if (onStageIndCount > 3) return { valid: false, message: `Maximum 3 Individual On-Stage events allowed. You have selected ${onStageIndCount}.` };
    if (onStageGroupCount > 2) return { valid: false, message: `Maximum 2 Group items allowed. You have selected ${onStageGroupCount}.` };

    return { valid: true };
};

// Fetch all registrations for a user
export const fetchUserRegistrations = async (uid: string): Promise<UserRegistrations> => {
    if (!db) {
        console.error("Firebase DB not initialized");
        return { soloEvents: [], teamEvents: [], totalCount: 0 };
    }
    if (!uid) return { soloEvents: [], teamEvents: [], totalCount: 0 };

    try {
        // 1. Fetch Solo Registrations
        const soloDocRef = doc(db, "registrations", uid);
        const soloDoc = await getDoc(soloDocRef);
        let soloEvents: string[] = [];
        if (soloDoc.exists()) {
            soloEvents = (soloDoc.data() as SoloRegistration).events || [];
        }

        // 2. Fetch Team Registrations (where user is a member)
        const teamsRef = collection(db, "teams");
        // We will assume a 'memberIds' field exists for querying
        const q = query(teamsRef, where("memberIds", "array-contains", uid));
        const querySnapshot = await getDocs(q);
        const teamEvents: TeamRegistration[] = [];
        querySnapshot.forEach((doc) => {
            teamEvents.push({ id: doc.id, ...doc.data() } as TeamRegistration);
        });

        const totalCount = soloEvents.length + teamEvents.length;

        return { soloEvents, teamEvents, totalCount };
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return { soloEvents: [], teamEvents: [], totalCount: 0 };
    }
};

// Toggle Solo Event Registration (Deprecated for batch update, but kept if needed)
export const toggleSoloEvent = async (uid: string, eventTitle: string, isSelected: boolean): Promise<{ success: boolean; message?: string }> => {
    // This function is largely replaced by batch update but kept for compatibility.
    return { success: false, message: "Please use batch update." };
};

// Create Team Registration
export const createTeam = async (
    leaderUid: string,
    leaderName: string,
    leaderEmail: string,
    eventTitle: string,
    members: TeamMember[]
): Promise<{ success: boolean; message?: string }> => {
    if (!db) return { success: false, message: "Database not initialized" };
    if (!leaderUid) return { success: false, message: "User not logged in" };

    try {
        const { soloEvents, teamEvents } = await fetchUserRegistrations(leaderUid);

        // Validate Limits
        const validation = validateRegistrationRules(soloEvents, teamEvents, null, eventTitle);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Validate Team Size
        const eventInfo = getEventDetails(eventTitle);
        if (eventInfo) {
            const min = eventInfo.minParticipants || 1;
            const max = eventInfo.maxParticipants || 100;
            if (members.length < min) return { success: false, message: `Minimum ${min} participants required.` };
            if (members.length > max) return { success: false, message: `Maximum ${max} participants allowed.` };
        }

        // Add 'memberIds' for querying
        const memberIds = members.map(m => m.uid);

        await addDoc(collection(db, "teams"), {
            eventId: eventTitle, // using title as ID for simplicity in checking
            eventTitle: eventTitle,
            leaderId: leaderUid,
            members: members,
            memberIds: memberIds, // Helper field
            status: "confirmed",
            createdAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating team:", error);
        return { success: false, message: "Failed to create team." };
    }
};

// Batch Update Solo Events (Save Changes)
export const updateUserSoloRegistrations = async (uid: string, events: string[]): Promise<{ success: boolean; message?: string }> => {
    if (!db) return { success: false, message: "Database not initialized" };
    if (!uid) return { success: false, message: "User not logged in" };

    try {
        const { soloEvents, teamEvents } = await fetchUserRegistrations(uid);

        // Validate Limits
        const validation = validateRegistrationRules(soloEvents, teamEvents, events);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const soloDocRef = doc(db, "registrations", uid);
        await setDoc(soloDocRef, {
            userId: uid,
            events: events,
            lastUpdated: new Date().toISOString()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error updating registrations:", error);
        return { success: false, message: "Failed to update registrations." };
    }
};

// Leave / Delete Team
export const leaveTeam = async (uid: string, teamId: string): Promise<{ success: boolean; message?: string }> => {
    if (!db) return { success: false, message: "Database not initialized" };
    try {
        const teamDocRef = doc(db, "teams", teamId);
        const teamDoc = await getDoc(teamDocRef);

        if (!teamDoc.exists()) return { success: false, message: "Team not found" };

        const teamData = teamDoc.data() as TeamRegistration;

        if (teamData.leaderId === uid) {
            // Leader leaving = Disband team
            await deleteDoc(teamDocRef);
            return { success: true, message: "Team disbanded successfully." };
        } else {
            return { success: false, message: "Only the leader can delete the team registration." };
        }
    } catch (error) {
        console.error("Error leaving team:", error);
        return { success: false, message: "Failed to leave team." };
    }
};
