import { University } from "@/types/university";
import {
  enhanceUniversityWithCourses,
  validateCourseAssignments,
  getGlobalCourseAssignmentStats,
  getUniversityCourseStats,
} from "@/services/universityCourseAssignmentService";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities";

// Apply course assignments to all universities
export function applyCoursesToAllUniversities(): University[] {
  return ALL_SOUTH_AFRICAN_UNIVERSITIES.map((university) =>
    enhanceUniversityWithCourses(university),
  );
}

// Generate detailed report of course assignments
export function generateCourseAssignmentReport() {
  const validation = validateCourseAssignments();
  const globalStats = getGlobalCourseAssignmentStats();

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCourses: globalStats.totalCourses,
      totalUniversities: Object.keys(globalStats.universityStats).length,
      assignmentTypes: globalStats.assignmentTypeStats,
      validationErrors: validation.errors.length,
      validationWarnings: validation.warnings.length,
    },
    universitiesBreakdown: Object.entries(globalStats.universityStats).map(
      ([univId, stats]) => ({
        universityId: univId,
        totalCourses: stats.totalCourses,
        facultyBreakdown: stats.facultyBreakdown,
        coursesWithCustomAps: stats.coursesWithCustomAps,
      }),
    ),
    facultyBreakdown: globalStats.facultyStats,
    validation: validation,
  };

  return report;
}

// Test specific university course assignments
export function testUniversityCourseAssignments(universityId: string) {
  const university = ALL_SOUTH_AFRICAN_UNIVERSITIES.find(
    (u) => u.id === universityId,
  );
  if (!university) {
    throw new Error(`University ${universityId} not found`);
  }

  const originalFacultiesCount = university.faculties.length;
  const originalCoursesCount = university.faculties.reduce(
    (total, faculty) => total + faculty.degrees.length,
    0,
  );

  const enhancedUniversity = enhanceUniversityWithCourses(university);
  const stats = getUniversityCourseStats(universityId);

  return {
    universityId,
    universityName: university.name,
    originalData: {
      faculties: originalFacultiesCount,
      courses: originalCoursesCount,
    },
    enhancedData: {
      faculties: enhancedUniversity.faculties.length,
      courses: enhancedUniversity.faculties.reduce(
        (total, faculty) => total + faculty.degrees.length,
        0,
      ),
    },
    coursesAdded: stats.totalCourses - originalCoursesCount,
    facultiesAdded:
      enhancedUniversity.faculties.length - originalFacultiesCount,
    facultyBreakdown: stats.facultyBreakdown,
    customApsRequirements: stats.coursesWithCustomAps,
  };
}

// Example course assignment scenarios for testing
export const TEST_SCENARIOS = {
  // Test "all" assignment
  testAllAssignment: () => {
    const mbchbCourse = "mbchb";
    const universities = ["uct", "wits", "up", "ukzn", "sun"];

    return universities.map((univId) => ({
      university: univId,
      hasCourse:
        testUniversityCourseAssignments(univId).facultyBreakdown[
          "Faculty of Health Sciences"
        ] > 0,
    }));
  },

  // Test "exclude" assignment
  testExcludeAssignment: () => {
    const civilEngCourse = "bsc-eng-civil"; // excludes UWC, UNISA, UFH
    const excludedUniversities = ["uwc", "unisa", "ufh"];
    const includedUniversities = ["uct", "wits", "up"];

    return {
      excluded: excludedUniversities.map((univId) => ({
        university: univId,
        shouldNotHave: true,
        actuallyHas:
          testUniversityCourseAssignments(univId).facultyBreakdown[
            "Faculty of Engineering and the Built Environment"
          ] > 0,
      })),
      included: includedUniversities.map((univId) => ({
        university: univId,
        shouldHave: true,
        actuallyHas:
          testUniversityCourseAssignments(univId).facultyBreakdown[
            "Faculty of Engineering and the Built Environment"
          ] > 0,
      })),
    };
  },

  // Test "include_only" assignment
  testIncludeOnlyAssignment: () => {
    const astronomyCourse = "bsc-astronomy"; // Most except UCT, RU
    const includedUniversities = ["uct", "ru"];
    const excludedUniversities = ["wits", "up", "ukzn"];

    return {
      included: includedUniversities.map((univId) => ({
        university: univId,
        shouldHave: true,
        actuallyHas:
          testUniversityCourseAssignments(univId).facultyBreakdown[
            "Faculty of Science"
          ] > 0,
      })),
      excluded: excludedUniversities.map((univId) => ({
        university: univId,
        shouldNotHave: true,
        actuallyHas:
          testUniversityCourseAssignments(univId).facultyBreakdown[
            "Faculty of Science"
          ] > 0,
      })),
    };
  },

  // Test custom APS requirements
  testCustomApsRequirements: () => {
    const mbchbCourse = "mbchb";
    const universitiesWithCustomAps = [
      { id: "uct", expectedAps: 45 },
      { id: "wits", expectedAps: 44 },
      { id: "up", expectedAps: 42 },
      { id: "ukzn", expectedAps: 40 },
    ];

    return universitiesWithCustomAps.map(({ id, expectedAps }) => {
      const enhanced = enhanceUniversityWithCourses(
        ALL_SOUTH_AFRICAN_UNIVERSITIES.find((u) => u.id === id)!,
      );

      const mbchbDegree = enhanced.faculties
        .find((f) => f.name.includes("Health"))
        ?.degrees.find((d) => d.id === mbchbCourse);

      return {
        university: id,
        expectedAps,
        actualAps: mbchbDegree?.apsRequirement,
        isCorrect: mbchbDegree?.apsRequirement === expectedAps,
      };
    });
  },
};

// Performance testing
export function performanceTest() {
  const startTime = performance.now();

  const enhancedUniversities = applyCoursesToAllUniversities();
  const report = generateCourseAssignmentReport();

  const endTime = performance.now();

  return {
    executionTime: endTime - startTime,
    universitiesProcessed: enhancedUniversities.length,
    totalCoursesAssigned: report.summary.totalCourses,
    averageTimePerUniversity:
      (endTime - startTime) / enhancedUniversities.length,
    memoryUsage: {
      enhancedUniversitiesSize: JSON.stringify(enhancedUniversities).length,
      reportSize: JSON.stringify(report).length,
    },
  };
}

// Debug utilities
export const DEBUG_UTILS = {
  logCourseAssignments: (universityId: string) => {
    const test = testUniversityCourseAssignments(universityId);
    console.log(
      `\n=== Course Assignments for ${test.universityName} (${universityId}) ===`,
    );
    console.log(
      `Original: ${test.originalData.faculties} faculties, ${test.originalData.courses} courses`,
    );
    console.log(
      `Enhanced: ${test.enhancedData.faculties} faculties, ${test.enhancedData.courses} courses`,
    );
    console.log(
      `Added: ${test.coursesAdded} courses, ${test.facultiesAdded} faculties`,
    );
    console.log(`Faculty breakdown:`, test.facultyBreakdown);
    console.log(
      `Custom APS requirements: ${test.customApsRequirements} courses`,
    );
  },

  validateAllAssignments: () => {
    const validation = validateCourseAssignments();
    console.log("\n=== Course Assignment Validation ===");
    console.log(`Total courses: ${validation.totalCourses}`);
    console.log(`Errors: ${validation.errors.length}`);
    console.log(`Warnings: ${validation.warnings.length}`);

    if (validation.errors.length > 0) {
      console.log("\nErrors:");
      validation.errors.forEach((error, i) =>
        console.log(`${i + 1}. ${error}`),
      );
    }

    if (validation.warnings.length > 0) {
      console.log("\nWarnings:");
      validation.warnings.forEach((warning, i) =>
        console.log(`${i + 1}. ${warning}`),
      );
    }

    return validation;
  },

  generateFullReport: () => {
    const report = generateCourseAssignmentReport();
    console.log("\n=== Full Course Assignment Report ===");
    console.log(JSON.stringify(report, null, 2));
    return report;
  },
};
