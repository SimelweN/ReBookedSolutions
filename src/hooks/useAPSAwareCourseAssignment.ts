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
/**
 * Enhanced hook for APS-aware course assignment with user state management
 * Uses sessionStorage for temporary storage - data clears on browser refresh
 */

export interface UserAPSProfile {
  subjects: APSSubject[];
  totalAPS: number;
  lastUpdated: string;
  isValid?: boolean;
  validationErrors?: string[];
  universitySpecificScores?: import("@/types/university").UniversityAPSResult[];
}

export interface APSAwareState {
  userProfile: UserAPSProfile | null;
  isLoading: boolean;
  error: string | null;
  lastSearchResults: CoursesForUniversityResult | null;
}

// Custom hook for sessionStorage (temporary storage)
function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (valueToStore === null || valueToStore === undefined) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}

export function useAPSAwareCourseAssignment(universityId?: string) {
  // Temporary user APS profile (session only)
  const [userProfile, setUserProfile] =
    useSessionStorage<UserAPSProfile | null>("userAPSProfile", null);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchResults, setLastSearchResults] =
    useState<CoursesForUniversityResult | null>(null);

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
          return;
        }

        // Calculate APS
        const apsResult = calculateAPS(subjects);

        const profile: UserAPSProfile = {
          subjects,
          totalAPS: apsResult.totalScore,
          lastUpdated: new Date().toISOString(),
          isValid: validation.isValid,
          validationErrors: validation.errors,
        };

        setUserProfile(profile);
      } catch (err) {
        setError(`Error updating APS profile: ${err}`);
      } finally {
        setIsLoading(false);
      }
    },
    [setUserProfile],
  );

  /**
   * Search for courses with current user's APS profile
   */
  const searchCoursesForUniversity = useCallback(
    async (
      targetUniversityId: string,
      options: Partial<APSFilterOptions> = {},
    ): Promise<CoursesForUniversityResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const apsOptions: APSFilterOptions = {
          userAPS: userProfile?.totalAPS,
          userSubjects: userProfile?.subjects,
          includeAlmostQualified: true,
          maxAPSGap: 5,
          ...options,
        };

        const result = await Promise.resolve(
          getCoursesForUniversityWithAPS(targetUniversityId, apsOptions),
        );

        if (result.errors.length > 0) {
          setError(result.errors.join("; "));
        }

        setLastSearchResults(result);
        return result;
      } catch (err) {
        const errorMsg = `Error searching courses: ${err}`;
        setError(errorMsg);

        // Return empty result on error
        return {
          universityId: targetUniversityId,
          courses: [],
          totalCourses: 0,
          eligibleCourses: 0,
          almostEligibleCourses: 0,
          errors: [errorMsg],
          warnings: [],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile],
  );

  /**
   * Check if user is eligible for a specific program
   */
  const checkProgramEligibility = useCallback(
    (
      programAPS: number,
      requiredSubjects: Array<{
        name: string;
        level: number;
        isRequired: boolean;
      }> = [],
    ) => {
      if (!userProfile) {
        return {
          eligible: false,
          reason: "No APS profile found",
          apsGap: programAPS,
          missingSubjects: requiredSubjects
            .filter((s) => s.isRequired)
            .map((s) => s.name),
        };
      }

      const apsGap = Math.max(0, programAPS - userProfile.totalAPS);
      const apsEligible = userProfile.totalAPS >= programAPS;

      // Check subject requirements
      const missingSubjects: string[] = [];
      requiredSubjects
        .filter((s) => s.isRequired)
        .forEach((reqSubject) => {
          const userSubject = userProfile.subjects.find(
            (us) =>
              us.name.toLowerCase().includes(reqSubject.name.toLowerCase()) ||
              reqSubject.name.toLowerCase().includes(us.name.toLowerCase()),
          );

          if (!userSubject || userSubject.level < reqSubject.level) {
            missingSubjects.push(
              `${reqSubject.name} (Level ${reqSubject.level})`,
            );
          }
        });

      const subjectsEligible = missingSubjects.length === 0;
      const overallEligible = apsEligible && subjectsEligible;

      return {
        eligible: overallEligible,
        reason: !apsEligible
          ? `Need ${apsGap} more APS points`
          : !subjectsEligible
            ? `Missing required subjects: ${missingSubjects.join(", ")}`
            : "Eligible",
        apsGap,
        missingSubjects,
      };
    },
    [userProfile],
  );

  /**
   * Clear APS profile completely - removes all APS-based logic across the site
   * Returns everything to clean state as if no APS was ever entered
   */
  const clearAPSProfile = useCallback(() => {
    setUserProfile(null);
    setLastSearchResults(null);
    setError(null);

// Custom hook for sessionStorage (temporary storage)
function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  };

  // Add an effect to listen for external sessionStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = sessionStorage.getItem(key);
        const newValue = item ? JSON.parse(item) : initialValue;
        if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
          setStoredValue(newValue);
        }
      } catch (error) {
        console.error("Error reading from sessionStorage:", error);
      }
    };

    // Check for changes periodically (since sessionStorage doesn't emit events)
    const interval = setInterval(handleStorageChange, 100);

    return () => clearInterval(interval);
  }, [key, initialValue, storedValue]);

  return [storedValue, setValue] as const;
}

export function useAPSAwareCourseAssignment(universityId?: string) {
  // Temporary user APS profile (session only)
  const [userProfile, setUserProfile] =
    useSessionStorage<UserAPSProfile | null>("userAPSProfile", null);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchResults, setLastSearchResults] =
    useState<CoursesForUniversityResult | null>(null);

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
        const totalAPS = calculateAPS(subjects);

        // Create profile
        const profile: UserAPSProfile = {
          subjects,
          totalAPS,
          lastUpdated: new Date().toISOString(),
          isValid: true,
        };

        // Save to session storage
        setUserProfile(profile);
        return true;
      } catch (error) {
        console.error("Error updating user subjects:", error);
        setError("Failed to update subjects. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUserProfile]
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
          userProfile.subjects
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
    [userProfile, universityId]
  );

  /**
   * Check if user qualifies for a specific program
   */
  const checkProgramEligibility = useCallback(
    (program: any) => {
      if (!userProfile) return { eligible: false, reason: "No APS profile" };

      try {
        return assessEligibility(userProfile.subjects, program);
      } catch (error) {
        console.error("Error checking eligibility:", error);
        return { eligible: false, reason: "Error checking eligibility" };
      }
    },
    [userProfile]
  );

  /**
   * Clear user's APS profile
   */
  const clearAPSProfile = useCallback(() => {
    try {
      sessionStorage.removeItem("userAPSProfile");
      sessionStorage.removeItem("apsSearchResults");
      setUserProfile(null);
      setLastSearchResults(null);
      setError(null);
    } catch (error) {
      console.error("Error clearing APS profile:", error);
    }
  }, [setUserProfile]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    userProfile,
    isLoading,
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
    updateUserSubjects,
    searchCoursesForUniversity,
    checkProgramEligibility,
    clearAPSProfile,
    clearError,
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
    }),
    [includeAlmostQualified, maxAPSGap],
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
 * Hook for cached search results across components
 */
export function useCachedAPSSearch() {
  const searchWithCache = useCallback(
    (query: {
      universityId?: string;
      apsOptions?: APSFilterOptions;
      facultyFilter?: string;
      searchTerm?: string;
    }) => {
      return APSAwareCourseSearchService.searchPrograms(query);
    },
    [],
  );

  return { searchWithCache };
}