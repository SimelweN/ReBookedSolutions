import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { APSSubject } from "@/types/university";

/**
 * Enhanced APS persistence service that handles both authenticated and non-authenticated users
 * - Authenticated users: Primary storage in database + localStorage backup
 * - Non-authenticated users: localStorage only
 */

export interface UserAPSProfile {
  subjects: APSSubject[];
  totalAPS: number;
  lastUpdated: string;
  isValid?: boolean;
  validationErrors?: string[];
  universitySpecificScores?: any[];
}

export interface APSStorageResult {
  success: boolean;
  error?: string;
  source?: "database" | "localStorage" | "sessionStorage";
}

const APS_STORAGE_KEY = "userAPSProfile";
const APS_BACKUP_KEY = "apsProfileBackup";

/**
 * Save APS profile with authentication-aware storage strategy
 */
export async function saveAPSProfile(
  profile: UserAPSProfile,
  user?: User | null,
): Promise<APSStorageResult> {
  try {
    // Always save to localStorage for immediate access
    localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(profile));

    if (user) {
      // For authenticated users, also save to database
      try {
        const { data, error } = await supabase.rpc("save_user_aps_profile", {
          profile_data: profile,
          user_id: user.id,
        });

        if (error) {
          console.warn("Database save failed, using localStorage only:", error);
          // Keep localStorage version as primary
          return {
            success: true,
            source: "localStorage",
            error: `Database save failed: ${error.message}`,
          };
        }

        return {
          success: true,
          source: "database",
        };
      } catch (dbError) {
        console.warn(
          "Database connection failed, using localStorage only:",
          dbError,
        );
        return {
          success: true,
          source: "localStorage",
          error: "Database unavailable",
        };
      }
    } else {
      // For non-authenticated users, localStorage is the primary storage
      return {
        success: true,
        source: "localStorage",
      };
    }
  } catch (error) {
    console.error("Failed to save APS profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Load APS profile with authentication-aware retrieval strategy
 */
export async function loadAPSProfile(
  user?: User | null,
): Promise<{ profile: UserAPSProfile | null; source: string; error?: string }> {
  try {
    if (user) {
      // For authenticated users, try database first, fallback to localStorage
      try {
        const { data: dbProfile, error } = await supabase.rpc(
          "get_user_aps_profile",
          {
            user_id: user.id,
          },
        );

        if (!error && dbProfile) {
          // Validate database profile structure
          if (isValidAPSProfile(dbProfile)) {
            // Save to localStorage as backup
            localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(dbProfile));
            return {
              profile: dbProfile,
              source: "database",
            };
          }
        }

        // Database failed or no profile, try localStorage
        const localProfile = getLocalStorageProfile();
        if (localProfile) {
          // Auto-sync valid localStorage profile to database
          setTimeout(async () => {
            try {
              await supabase.rpc("save_user_aps_profile", {
                profile_data: localProfile,
                user_id: user.id,
              });
              console.log("Auto-synced localStorage profile to database");
            } catch (syncError) {
              console.warn("Auto-sync failed:", syncError);
            }
          }, 1000);

          return {
            profile: localProfile,
            source: "localStorage",
            error: error
              ? `Database error: ${error.message}`
              : "No database profile found",
          };
        }

        return {
          profile: null,
          source: "none",
          error: "No profile found in database or localStorage",
        };
      } catch (dbError) {
        console.warn(
          "Database connection failed, using localStorage:",
          dbError,
        );

        // Fallback to localStorage
        const localProfile = getLocalStorageProfile();
        return {
          profile: localProfile,
          source: "localStorage",
          error: "Database unavailable",
        };
      }
    } else {
      // For non-authenticated users, use localStorage only
      const localProfile = getLocalStorageProfile();
      return {
        profile: localProfile,
        source: localProfile ? "localStorage" : "none",
      };
    }
  } catch (error) {
    console.error("Failed to load APS profile:", error);
    return {
      profile: null,
      source: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear APS profile from all storage locations
 */
export async function clearAPSProfile(
  user?: User | null,
): Promise<APSStorageResult> {
  try {
    // Clear localStorage and sessionStorage
    localStorage.removeItem(APS_STORAGE_KEY);
    localStorage.removeItem(APS_BACKUP_KEY);
    localStorage.removeItem("apsSearchResults");
    sessionStorage.removeItem(APS_STORAGE_KEY);
    sessionStorage.removeItem("apsSearchResults");

    if (user) {
      // For authenticated users, also clear from database
      try {
        const { error } = await supabase.rpc("clear_user_aps_profile", {
          user_id: user.id,
        });

        if (error) {
          console.warn("Database clear failed:", error);
          return {
            success: true,
            source: "localStorage",
            error: `Database clear failed: ${error.message}`,
          };
        }

        return {
          success: true,
          source: "database",
        };
      } catch (dbError) {
        console.warn("Database connection failed during clear:", dbError);
        return {
          success: true,
          source: "localStorage",
          error: "Database unavailable",
        };
      }
    }

    return {
      success: true,
      source: "localStorage",
    };
  } catch (error) {
    console.error("Failed to clear APS profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sync localStorage profile to database for authenticated users
 */
export async function syncProfileToDatabase(
  user: User,
): Promise<APSStorageResult> {
  try {
    const localProfile = getLocalStorageProfile();
    if (!localProfile) {
      return {
        success: false,
        error: "No localStorage profile to sync",
      };
    }

    const { error } = await supabase.rpc("save_user_aps_profile", {
      profile_data: localProfile,
      user_id: user.id,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      source: "database",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if profile needs to be synced between storages
 */
export async function checkSyncStatus(user?: User | null): Promise<{
  needsSync: boolean;
  recommendation: "none" | "localToDb" | "dbToLocal";
  localProfile?: UserAPSProfile | null;
  dbProfile?: UserAPSProfile | null;
}> {
  if (!user) {
    return { needsSync: false, recommendation: "none" };
  }

  try {
    const localProfile = getLocalStorageProfile();

    const { data: dbProfile } = await supabase.rpc("get_user_aps_profile", {
      user_id: user.id,
    });

    // If only local profile exists
    if (localProfile && !dbProfile) {
      return {
        needsSync: true,
        recommendation: "localToDb",
        localProfile,
        dbProfile: null,
      };
    }

    // If only database profile exists
    if (!localProfile && dbProfile) {
      return {
        needsSync: true,
        recommendation: "dbToLocal",
        localProfile: null,
        dbProfile,
      };
    }

    // If both exist, check which is newer
    if (localProfile && dbProfile) {
      const localDate = new Date(localProfile.lastUpdated);
      const dbDate = new Date(dbProfile.lastUpdated);

      if (localDate > dbDate) {
        return {
          needsSync: true,
          recommendation: "localToDb",
          localProfile,
          dbProfile,
        };
      } else if (dbDate > localDate) {
        return {
          needsSync: true,
          recommendation: "dbToLocal",
          localProfile,
          dbProfile,
        };
      }
    }

    return {
      needsSync: false,
      recommendation: "none",
      localProfile,
      dbProfile,
    };
  } catch (error) {
    console.warn("Sync status check failed:", error);
    return { needsSync: false, recommendation: "none" };
  }
}

/**
 * Get profile from localStorage with error handling
 */
function getLocalStorageProfile(): UserAPSProfile | null {
  try {
    const stored = localStorage.getItem(APS_STORAGE_KEY);
    if (!stored) {
      console.log("No APS profile found in localStorage");
      return null;
    }

    const parsed = JSON.parse(stored);
    const isValid = isValidAPSProfile(parsed);

    if (isValid) {
      console.log("✅ Valid APS profile loaded from localStorage:", parsed);
      return parsed;
    } else {
      console.warn(
        "❌ Invalid APS profile structure in localStorage, clearing it",
      );
      localStorage.removeItem(APS_STORAGE_KEY);
      return null;
    }
  } catch (error) {
    console.warn("Failed to parse localStorage APS profile:", error);
    localStorage.removeItem(APS_STORAGE_KEY); // Clear corrupted data
    return null;
  }
}

/**
 * Validate APS profile structure
 */
function isValidAPSProfile(profile: any): profile is UserAPSProfile {
  if (!profile || typeof profile !== "object") return false;

  const required = ["subjects", "totalAPS", "lastUpdated"];
  for (const field of required) {
    if (!(field in profile)) {
      console.warn(`Missing required field in APS profile: ${field}`);
      return false;
    }
  }

  const isValid =
    Array.isArray(profile.subjects) &&
    typeof profile.totalAPS === "number" &&
    typeof profile.lastUpdated === "string" &&
    profile.subjects.length >= 0; // Allow empty subjects array

  if (!isValid) {
    console.warn("Invalid APS profile structure:", {
      subjectsIsArray: Array.isArray(profile.subjects),
      totalAPSIsNumber: typeof profile.totalAPS === "number",
      lastUpdatedIsString: typeof profile.lastUpdated === "string",
      subjects: profile.subjects,
    });
  }

  return isValid;
}

/**
 * Migration helper: Move sessionStorage data to localStorage if needed
 */
export function migrateSessionToLocal(): boolean {
  try {
    const sessionProfile = sessionStorage.getItem(APS_STORAGE_KEY);
    const localProfile = localStorage.getItem(APS_STORAGE_KEY);

    // If session has data but local doesn't, migrate it
    if (sessionProfile && !localProfile) {
      localStorage.setItem(APS_STORAGE_KEY, sessionProfile);
      sessionStorage.removeItem(APS_STORAGE_KEY);
      console.log("Migrated APS profile from sessionStorage to localStorage");
      return true;
    }

    return false;
  } catch (error) {
    console.warn("Failed to migrate session to local storage:", error);
    return false;
  }
}
