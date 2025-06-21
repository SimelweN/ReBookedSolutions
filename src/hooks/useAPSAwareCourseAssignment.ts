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
    (subjects: APSSubject[]) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate subjects
        const validation = validateAPSSubjects(subjects);

        // Calculate APS
        const apsCalculation = calculateAPS(subjects);

        // Create new profile
        const newProfile: UserAPSProfile = {
          subjects: subjects,
          totalAPS: apsCalculation.totalScore,
          lastUpdated: new Date().toISOString(),
          isValid: validation.isValid,
          validationErrors: validation.errors,
          universitySpecificScores: apsCalculation.universitySpecificScores,
        };

        setUserProfile(newProfile);

        // Clear previous search results when profile changes
        setLastSearchResults(null);
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
   * Get faculties with APS filtering
   */
  const getFacultiesForUniversity = useCallback(
    async (
      targetUniversityId: string,
      options: Partial<APSFilterOptions> = {},
    ) => {
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
          getUniversityFacultiesWithAPS(targetUniversityId, apsOptions),
        );

        if (result.errors.length > 0) {
          setError(result.errors.join("; "));
        }

        return result;
      } catch (err) {
        const errorMsg = `Error getting faculties: ${err}`;
        setError(errorMsg);
        return {
          faculties: [],
          statistics: {
            totalFaculties: 0,
            totalDegrees: 0,
            eligibleDegrees: 0,
            averageAPS: 0,
          },
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
   * Check if user qualifies for specific program
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
   * Clear user profile and cache
   */
  const clearUserProfile = useCallback(() => {
    setUserProfile(null);
    setLastSearchResults(null);
    setError(null);
  }, [setUserProfile]);

  /**
   * Auto-search when university changes (if user has profile)
   */
  useEffect(() => {
    if (universityId && userProfile && userProfile.isValid) {
      searchCoursesForUniversity(universityId);
    }
  }, [universityId, userProfile, searchCoursesForUniversity]);

  /**
   * Computed values
   */
  const hasValidProfile = useMemo(() => {
    return (
      userProfile && userProfile.isValid && userProfile.subjects.length >= 4
    );
  }, [userProfile]);

  const qualificationSummary = useMemo(() => {
    if (!lastSearchResults) {
      return null;
    }

    const { courses, eligibleCourses, almostEligibleCourses, totalCourses } =
      lastSearchResults;

    return {
      totalPrograms: totalCourses,
      eligible: eligibleCourses,
      almostEligible: almostEligibleCourses,
      percentageEligible:
        totalCourses > 0
          ? Math.round((eligibleCourses / totalCourses) * 100)
          : 0,
      topEligiblePrograms: courses
        .filter((c) => c.isEligible)
        .slice(0, 5)
        .map((c) => ({
          name: c.name,
          faculty: c.faculty,
          aps: c.apsGap + (userProfile?.totalAPS || 0),
        })),
    };
  }, [lastSearchResults, userProfile]);

  return {
    // State
    userProfile,
    isLoading,
    error,
    lastSearchResults,
    hasValidProfile,
    qualificationSummary,

    // Actions
    updateUserSubjects,
    searchCoursesForUniversity,
    getFacultiesForUniversity,
    checkProgramEligibility,
    clearUserProfile,

    // Utils
    clearError: () => setError(null),
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
