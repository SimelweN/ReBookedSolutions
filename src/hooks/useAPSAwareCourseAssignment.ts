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
import { useLocalStorage } from "./useLocalStorage";

/**
 * Enhanced hook for APS-aware course assignment with user state management
 * Addresses the critical issue of no APS filtering in program assignment
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

export function useAPSAwareCourseAssignment(universityId?: string) {
  // Persistent user APS profile
  const [userProfile, setUserProfile] = useLocalStorage<UserAPSProfile | null>(
    "userAPSProfile",
    null,
  );

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
   * Clear APS profile completely from all universities
   */
  const clearAPSProfile = useCallback(() => {
    setUserProfile(null);
    setLastSearchResults(null);
    setError(null);

    // Clear any cached data in localStorage related to APS
    try {
      localStorage.removeItem("userAPSProfile");
      localStorage.removeItem("apsSearchResults");
      localStorage.removeItem("universityAPSScores");
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
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
