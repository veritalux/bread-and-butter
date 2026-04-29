import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AppUser } from "../types/user";
import { makeInitials, CURRENT_ACCOUNT_VERSION } from "../types/user";

/**
 * Run any pending migrations for this user account.
 * Each migration runs once — guarded by accountVersion.
 * Returns the updated user if changes were made, otherwise the original.
 */
export async function migrateAccount(user: AppUser): Promise<AppUser> {
  const version = user.accountVersion ?? 0;
  if (version >= CURRENT_ACCOUNT_VERSION) return user;

  const updates: Partial<AppUser> = {};

  // --- Migration 1: assign unassigned users to moderator SAID8JEH, generate coach codes for old moderators ---
  if (version < 1) {
    if (user.role === "user" && !user.moderatorId) {
      // Find the moderator with coachCode SAID8JEH
      const modQuery = query(
        collection(db, "users"),
        where("coachCode", "==", "SAID8JEH")
      );
      const modSnap = await getDocs(modQuery);
      if (!modSnap.empty) {
        updates.moderatorId = modSnap.docs[0].id;
      }
    }

    if (user.role === "moderator" && !user.coachCode) {
      // Generate a coach code: last name (up to 4 chars) + first 4 chars of UID
      const namePart = user.name.trim().split(/\s+/).pop()!.toUpperCase().slice(0, 4);
      const uidPart = user.id.slice(0, 4).toUpperCase();
      updates.coachCode = namePart + uidPart;
    }

    // Ensure initials are set (older accounts may be missing them)
    if (!user.initials) {
      updates.initials = makeInitials(user.name);
    }
  }

  // Mark account as current version
  updates.accountVersion = CURRENT_ACCOUNT_VERSION;

  // Write updates to Firestore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...firestoreUpdates } = updates as AppUser;
  await updateDoc(doc(db, "users", user.id), firestoreUpdates);

  return { ...user, ...updates };
}
