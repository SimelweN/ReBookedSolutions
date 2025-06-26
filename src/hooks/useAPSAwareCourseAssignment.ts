import { useState, useEffect, useMemo, useCallback } from "react";
import { APSSubject } from "@/types/university";
import {
  APSFilterOptions,
  CoursesForUniversityResult,
  getCoursesForUniversityWithAPS,
  getUniversityFacultiesWithAPS,
  APSAwareCourseSearchService,
} from "@/services/apsAwareCourseAssignmentService";
import { calculateAPS, validateAPSSubjects } from "@/utils/apsCalculation";
import { checkSubjectMatching } from "@/services/newSubjectEngine";

/**
 * Enhanced hook for APS-aware course assignment with localStorage persistence
 * - Simple, reliable localStorage-based storage
 * - Auto-save functionality to prevent data loss
 * - Persistent data until manually cleared
 */

export interface UserAPSProfile {
  subjects: APSSubject[];
  totalAPS: number;
  lastUpdated: string;
  isValid?: boolean;
  validationErrors?: string[];
  universitySpecificScores?: Array<{
    universityId: string;
    score: number;
    subjects: APSSubject[];
  }>;
  savedAt?: number;
}

export interface APSAwareState {
  userProfile: UserAPSProfile | null;
  isLoading: boolean;
  error: string | null;
  lastSearchResults: CoursesForUniversityResult | null;
  storageSource?: string;
  syncStatus?: {
    needsSync: boolean;
    recommendation: "none" | "localToDb" | "dbToLocal";
  };
}

// Simplified localStorage-first storage hook for reliability
function useAPSLocalStorage() {
  const [userProfile, setUserProfile] = useState<UserAPSProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load profile from localStorage on mount
  const loadProfile = useCallback(() => {
    try {
      console.log("📦 Loading APS profile from localStorage...");
      console.log("📦 All localStorage keys:", Object.keys(localStorage));
      const stored = localStorage.getItem("userAPSProfile");
      console.log("📦 Raw stored data:", stored);

      if (stored) {
        const profile = JSON.parse(stored);
        console.log("✅ APS Profile loaded from localStorage:", profile);
        console.log("✅ Profile has subjects:", profile.subjects?.length || 0);
        setUserProfile(profile);
        return profile;
      } else {
        console.log("ℹ️ No APS profile found in localStorage");
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to load APS profile from localStorage:", error);
      setUserProfile(null);
      return null;
    }
  }, []);

  // Save profile to localStorage
  const saveProfile = useCallback(async (profile: UserAPSProfile) => {
    try {
      console.log("💾 Saving APS profile to localStorage:", profile);

      // Add timestamp to ensure we track when it was saved
      const profileWithTimestamp = {
        ...profile,
        lastUpdated: new Date().toISOString(),
        savedAt: Date.now(),
      };

      localStorage.setItem(
        "userAPSProfile",
        JSON.stringify(profileWithTimestamp),
      );
      setUserProfile(profileWithTimestamp);

      // Verify it was actually saved
      const verification = localStorage.getItem("userAPSProfile");
      console.log("🔍 Verification - saved data exists:", !!verification);

      if (verification) {
        console.log("✅ APS Profile saved and verified successfully");
        return true;
      } else {
        console.error("❌ APS Profile save verification failed");
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to save APS profile:", error);
      return false;
    }
  }, []);

  // Clear profile from localStorage
  const clearProfile = useCallback(async () => {
    try {
      console.log("🗑️ Clearing APS profile from localStorage");
      localStorage.removeItem("userAPSProfile");
      localStorage.removeItem("apsSearchResults");
      sessionStorage.removeItem("userAPSProfile");
      sessionStorage.removeItem("apsSearchResults");
      setUserProfile(null);

      // Trigger global state reset event
      window.dispatchEvent(new CustomEvent("apsProfileCleared"));
      console.log("✅ APS Profile cleared successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear APS profile:", error);
      return false;
    }
  }, []);

  // Load profile on mount and whenever localStorage changes
  useEffect(() => {
    console.log("🚀 Initializing APS localStorage hook...");
    loadProfile();

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userAPSProfile") {
        console.log("📡 localStorage changed in another tab, reloading...");
        loadProfile();
      }
    };

    // Listen for manual profile clear events
    const handleProfileCleared = () => {
      console.log("🗑️ APS profile cleared event received");
      setUserProfile(null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apsProfileCleared", handleProfileCleared);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apsProfileCleared", handleProfileCleared);
    };
  }, [loadProfile]);

  return {
    userProfile,
    setUserProfile: saveProfile,
    clearProfile,
    storageSource: userProfile ? "localStorage" : "none",
    syncStatus: { needsSync: false, recommendation: "none" as const },
    isLoading,
    loadProfile,
  };
}

export function useAPSAwareCourseAssignment(universityId?: string) {
  // Simplified localStorage-based persistent storage
  const {
    userProfile,
    setUserProfile,
    clearProfile,
    storageSource,
    syncStatus,
    isLoading: storageLoading,
    loadProfile,
  } = useAPSLocalStorage();

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchResults, setLastSearchResults] =
    useState<CoursesForUniversityResult | null>(null);

  // Combine storage loading with component loading
  const totalLoading = storageLoading || isLoading;

  /**
   * Update user's APS subjects and recalculate profile
   */
  const updateUserSubjects = useCallback(
    async (subjects: APSSubject[]) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate subjects (but still save even if validation has warnings)
        const validation = validateAPSSubjects(subjects);

        // Calculate total APS
        const apsCalculation = calculateAPS(subjects);
        const totalAPS = apsCalculation.totalScore || 0;

        // Create profile - save regardless of validation to ensure persistence
        const profile: UserAPSProfile = {
          subjects,
          totalAPS,
          lastUpdated: new Date().toISOString(),
          isValid: validation.isValid,
          validationErrors: validation.errors,
          universitySpecificScores:
            apsCalculation.universitySpecificScores || [],
        };

        console.log(
          "📊 Updating APS profile with subjects:",
          subjects.length,
          "Total APS:",
          totalAPS,
        );

        // Save using simplified localStorage storage
        const success = await setUserProfile(profile);

        // Only set error if saving failed, not validation warnings
        if (!success) {
          setError("Failed to save APS profile");
          return false;
        }

        // Clear any previous errors since save was successful
        setError(null);

        // Show validation warnings but don't fail the operation
        if (!validation.isValid) {
          console.warn("⚠️ APS validation warnings:", validation.errors);
        }

        return success;
      } catch (error) {
        console.error("Error updating user subjects:", error);
        setError("Failed to update subjects. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUserProfile],
  );

  /**
   * Search courses for a specific university using user's APS
   */
  const searchCoursesForUniversity = useCallback(
    async (targetUniversityId: string) => {
      if (!userProfile) {
        console.warn("No user profile available for course search");
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const results = await getUniversityFacultiesWithAPS(
          targetUniversityId,
          userProfile.subjects,
        );

        // Cache results for current university
        if (targetUniversityId === universityId) {
          setLastSearchResults(results);
        }

        return results.programs || [];
      } catch (error) {
        console.error("Error searching courses:", error);
        setError("Failed to search courses. Please try again.");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile, universityId],
  );

  /**
   * Check if user qualifies for a specific program
   * Enhanced eligibility check with subject requirements and APS validation
   */
  const checkProgramEligibility = useCallback(
    (
      program: {
        id: string;
        name: string;
        apsRequired: number;
        subjects?: string[];
        faculty?: string;
        universityId?: string;
      },
      directAPS?: number,
    ) => {
      const apsToUse = directAPS || userProfile?.totalAPS;
      const userSubjects = userProfile?.subjects || [];

      if (!apsToUse)
        return { eligible: false, reason: "No APS profile available" };

      try {
        // Enhanced eligibility check
        const requiredAPS =
          program.apsRequirement || program.defaultAps || program.aps || 20;
        const apsGap = apsToUse >= requiredAPS ? 0 : requiredAPS - apsToUse;

        // Check basic APS requirement
        if (apsToUse < requiredAPS) {
          return {
            eligible: false,
            reason: `Need ${apsGap} more APS points (require ${requiredAPS}, have ${apsToUse})`,
            apsGap,
            meetsAPS: false,
          };
        }

        // Use FIXED subject requirement checking
        const subjectRequirements =
          program.subjects || program.subjectRequirements || [];

        if (subjectRequirements.length > 0) {
          const subjectCheck = checkSubjectMatching(
            userSubjects.map((s) => ({
              name: s.name,
              level: s.level,
              points: s.points,
            })),
            subjectRequirements.map((s) => ({
              name: s.name,
              level: s.level || s.minLevel || 4,
              isRequired: s.isRequired || s.required || false,
            })),
          );

          if (!subjectCheck.isEligible) {
            return {
              eligible: false,
              reason: `Subject requirements: ${subjectCheck.matchedCount}/${subjectCheck.requiredCount} met. ${subjectCheck.summary}`,
              meetsAPS: true,
              matchedCount: subjectCheck.matchedCount,
              requiredCount: subjectCheck.requiredCount,
              subjectDetails: subjectCheck.summary,
            };
          }
        }

        return {
          eligible: true,
          reason: "Meets all requirements",
          meetsAPS: true,
          apsGap: 0,
        };
      } catch (error) {
        console.error("Error checking program eligibility:", error);
        return { eligible: false, reason: "Error checking eligibility" };
      }
    },
    [userProfile],
  );

  /**
   * Clear user's APS profile from all storage locations
   */
  const clearAPSProfile = useCallback(async () => {
    try {
      const success = await clearProfile();

      if (success) {
        setLastSearchResults(null);
        setError(null);
      } else {
        setError("Failed to clear APS profile completely");
      }

      return success;
    } catch (error) {
      console.error("Error clearing APS profile:", error);
      setError("Failed to clear APS profile");
      return false;
    }
  }, [clearProfile]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    userProfile,
    isLoading: totalLoading,
    error,
    hasValidProfile: !!(
      userProfile?.subjects && userProfile.subjects.length >= 4
    ),
    qualificationSummary: userProfile
      ? {
          totalAPS: userProfile.totalAPS,
          subjectCount: userProfile.subjects.length,
          isValid: userProfile.isValid || false,
        }
      : null,
    storageSource,
    syncStatus,
    updateUserSubjects,
    searchCoursesForUniversity,
    checkProgramEligibility,
    clearAPSProfile,
    clearError,
    refreshProfile: loadProfile,
  };
}

/**
 * Hook for managing APS filtering options
 */
export function useAPSFilterOptions() {
  const [includeAlmostQualified, setIncludeAlmostQualified] = useState(true);
  const [maxAPSGap, setMaxAPSGap] = useState(5);
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"aps" | "eligibility" | "name">(
    "eligibility",
  );

  const filterOptions: APSFilterOptions = useMemo(
    () => ({
      includeAlmostQualified,
      maxAPSGap,
      facultyFilter,
      sortBy,
    }),
    [includeAlmostQualified, maxAPSGap, facultyFilter, sortBy],
  );

  return {
    filterOptions,
    includeAlmostQualified,
    setIncludeAlmostQualified,
    maxAPSGap,
    setMaxAPSGap,
    facultyFilter,
    setFacultyFilter,
    sortBy,
    setSortBy,
  };
}

/**
 * Enhanced search hook with caching
 */
export function useAPSSearch() {
  const searchWithCache = useCallback(
    async (query: {
      universityId?: string;
      faculty?: string;
      apsRange?: { min: number; max: number };
    }) => {
      return APSAwareCourseSearchService.searchPrograms(query);
    },
    [],
  );

  return { searchWithCache };
}
