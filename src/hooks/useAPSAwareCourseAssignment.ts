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
import { useAuth } from "@/contexts/AuthContext";
import {
  saveAPSProfile,
  loadAPSProfile,
  clearAPSProfile as clearAPSProfileService,
  checkSyncStatus,
  migrateSessionToLocal,
  UserAPSProfile,
} from "@/services/apsPersistenceService";

/**
 * Enhanced hook for APS-aware course assignment with authentication-aware persistence
 * - Authenticated users: Database + localStorage backup
 * - Non-authenticated users: localStorage only
 * - Automatic sync between storages
 * - Persistent data until manually cleared
 */

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

// Authentication-aware storage hook
function useAuthAwareAPSStorage() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserAPSProfile | null>(null);
  const [storageSource, setStorageSource] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    needsSync: boolean;
    recommendation: "none" | "localToDb" | "dbToLocal";
  }>({ needsSync: false, recommendation: "none" });

  // Load profile when component mounts or user changes
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Migrate any session data first
      migrateSessionToLocal();

      const { profile, source, error } = await loadAPSProfile(user);

      // Only set profile if we actually found data or this is a fresh mount
      if (profile) {
        console.log("✅ APS Profile loaded from:", source, profile);
        setUserProfile(profile);
        setStorageSource(source);
      } else {
        console.log("ℹ️ No APS profile found, maintaining current state");
        setStorageSource("none");
      }

      if (error) {
        console.warn("Profile load warning:", error);
      }

      // Check sync status for authenticated users
      if (isAuthenticated && user) {
        const syncInfo = await checkSyncStatus(user);
        setSyncStatus(syncInfo);
      }
    } catch (error) {
      console.error("Failed to load APS profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Save profile with authentication awareness
  const saveProfile = useCallback(
    async (profile: UserAPSProfile) => {
      setIsLoading(true);
      try {
        const result = await saveAPSProfile(profile, user);

        if (result.success) {
          setUserProfile(profile);
          setStorageSource(result.source || "unknown");

          // Update sync status
          if (isAuthenticated && user) {
            const syncInfo = await checkSyncStatus(user);
            setSyncStatus(syncInfo);
          }
        } else {
          console.error("Failed to save APS profile:", result.error);
        }

        return result.success;
      } catch (error) {
        console.error("Error saving APS profile:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAuthenticated],
  );

  // Clear profile from all storages
  const clearProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await clearAPSProfileService(user);

      if (result.success) {
        setUserProfile(null);
        setStorageSource("none");
        setSyncStatus({ needsSync: false, recommendation: "none" });

        // Trigger global state reset event
        window.dispatchEvent(new CustomEvent("apsProfileCleared"));
      } else {
        console.error("Failed to clear APS profile:", result.error);
      }

      return result.success;
    } catch (error) {
      console.error("Error clearing APS profile:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load profile when user auth state changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    userProfile,
    setUserProfile: saveProfile,
    clearProfile,
    storageSource,
    syncStatus,
    isLoading,
    loadProfile,
  };
}

export function useAPSAwareCourseAssignment(universityId?: string) {
  // Authentication-aware persistent storage
  const {
    userProfile,
    setUserProfile,
    clearProfile,
    storageSource,
    syncStatus,
    isLoading: storageLoading,
    loadProfile,
  } = useAuthAwareAPSStorage();

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

        // Validate subjects
        const validation = validateAPSSubjects(subjects);
        if (!validation.isValid) {
          setError(validation.errors.join("; "));
          return false;
        }

        // Calculate total APS
        const apsCalculation = calculateAPS(subjects);
        const totalAPS = apsCalculation.totalScore || 0;

        // Create profile
        const profile: UserAPSProfile = {
          subjects,
          totalAPS,
          lastUpdated: new Date().toISOString(),
          isValid: true,
          validationErrors: validation.errors,
          universitySpecificScores:
            apsCalculation.universitySpecificScores || [],
        };

        // Save using authentication-aware storage
        const success = await setUserProfile(profile);
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
   * Supports both userProfile and direct APS value from URL params
   */
  const checkProgramEligibility = useCallback(
    (program: any, directAPS?: number) => {
      const apsToUse = directAPS || userProfile?.totalAPS;

      if (!apsToUse) return { eligible: false, reason: "No APS profile" };

      try {
        // Basic eligibility check - can be enhanced
        const requiredAPS = program.apsRequirement || program.defaultAps || 20;

        return {
          eligible: apsToUse >= requiredAPS,
          reason:
            apsToUse >= requiredAPS
              ? "Meets APS requirement"
              : `APS too low (need ${requiredAPS}, have ${apsToUse})`,
        };
      } catch (error) {
        console.error("Error checking eligibility:", error);
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
