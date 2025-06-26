import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calculator,
  GraduationCap,
  TrendingUp,
  Target,
  BarChart3,
  Building,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Filter,
  Calendar,
  Trophy,
  MapPin,
  Eye,
  Users,
  Clock,
  Star,
  X,
  Plus,
  Loader2,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SOUTH_AFRICAN_SUBJECTS } from "@/constants/subjects";
import {
  useAPSAwareCourseAssignment,
  useAPSFilterOptions,
} from "@/hooks/useAPSAwareCourseAssignment";
import { toast } from "sonner";
import { APSSubject } from "@/types/university";
import {
  calculateAPS,
  convertPercentageToPoints,
  getAPSScoreDescription,
} from "@/utils/apsCalculation";
import { validateAPSSubjectsEnhanced } from "@/utils/enhancedValidation";
import { normalizeSubjectName } from "@/utils/subjectNormalization";
import UniversitySpecificAPSDisplay from "./UniversitySpecificAPSDisplay";
import EligibleProgramsSection from "./EligibleProgramsSection";
import APSStorageIndicator from "./APSStorageIndicator";
import APSRecoveryStatus from "./APSRecoveryStatus";

/**
 * Enhanced APS Calculator with two-section layout:
 * 1. Overview Section: Subject input and university-specific APS scores
 * 2. Programs Section: Faculty-grouped eligible programs
 */

interface APSSubjectInput {
  name: string;
  marks: number;
  level: number;
  points: number;
  isRequired: boolean;
}

const EnhancedAPSCalculator: React.FC = () => {
  const navigate = useNavigate();

  // APS-aware state management
  const {
    userProfile,
    isLoading,
    error,
    hasValidProfile,
    qualificationSummary,
    storageSource,
    syncStatus,
    updateUserSubjects,
    searchCoursesForUniversity,
    checkProgramEligibility,
    clearAPSProfile,
    clearError,
    refreshProfile,
  } = useAPSAwareCourseAssignment();

  // Local state
  const [subjects, setSubjects] = useState<APSSubjectInput[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedMarks, setSelectedMarks] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      apsRequired: number;
      universityId: string;
      faculty: string;
    }>
  >([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<{
    id: string;
    name: string;
    apsRequired: number;
    universityId: string;
    faculty: string;
  } | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [includeAlmostQualified, setIncludeAlmostQualified] = useState(true);
  const [sortBy, setSortBy] = useState<string>("eligibility");
  const [maxAPSGap] = useState(5);

  // New state for two-section layout
  const [showProgramsSection, setShowProgramsSection] = useState(false);

  // All 26 South African universities for APS calculation
  const ALL_UNIVERSITY_IDS = [
    "uct",
    "wits",
    "stellenbosch",
    "up",
    "ukzn",
    "ufs",
    "ru",
    "nwu",
    "uwc",
    "uj",
    "unisa",
    "ufh",
    "tut",
    "dut",
    "vut",
    "mut",
    "cput",
    "ul",
    "univen",
    "wsu",
    "smu",
    "ump",
    "unizulu",
    "cut",
    "nmu",
    "spu",
  ];

  // Calculate APS with all validations
  const apsCalculation = useMemo(() => {
    // Convert APSSubjectInput to APSSubject for calculations
    const apsSubjects: APSSubject[] = subjects.map((subject) => ({
      name: subject.name,
      marks: subject.marks,
      level: subject.points, // Ensure level matches points (APS level 1-7)
      points: subject.points,
    }));

    const apsResult = calculateAPS(apsSubjects);
    const validationResult = validateAPSSubjectsEnhanced(apsSubjects);

    // Calculate university-specific scores for all 26 universities
    const universitySpecificCalculation =
      apsSubjects.length > 0
        ? import("@/services/universitySpecificAPSService").then((module) =>
            module.calculateUniversitySpecificAPS(
              apsSubjects,
              ALL_UNIVERSITY_IDS,
            ),
          )
        : null;

    return {
      totalAPS: apsResult.totalScore, // Extract the totalScore property
      validationResult,
      isCalculationValid: validationResult.isValid && apsSubjects.length >= 6,
      fullCalculation: universitySpecificCalculation as Promise<unknown> | null,
      eligibleDegrees: apsResult.eligibleDegrees, // Also store eligible degrees
    };
  }, [subjects]);

  // Load university-specific calculation
  const [universitySpecificScores, setUniversitySpecificScores] =
    useState<Array<{
      universityId: string;
      score: number;
      subjects: Array<{ subject: string; marks: number }>;
    }> | null>(null);

  useEffect(() => {
    if (apsCalculation.fullCalculation) {
      apsCalculation.fullCalculation.then((result) => {
        setUniversitySpecificScores(result);
      });
    }
  }, [apsCalculation.fullCalculation]);

  // Load APS data when component mounts and restore subjects
  useEffect(() => {
    console.log("🔄 APS Calculator mounted, checking for saved profile...");

    // Force refresh profile data on mount to ensure we have latest data
    if (refreshProfile) {
      refreshProfile();
    }

    // Listen for profile cleared events
    const handleAPSProfileCleared = () => {
      console.log("🔄 APS Profile cleared event received");
      setSubjects([]);
      setUniversitySpecificScores(null);
      setSearchResults([]);
      setSelectedProgram(null);
      setIsDetailsModalOpen(false);
      setShowProgramsSection(false);
      clearError();
    };

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      console.log("🔄 Navigation detected, refreshing APS profile...");
      if (refreshProfile) {
        refreshProfile();
      }
    };

    // Listen for beforeunload to save any pending changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (subjects.length > 0) {
        // Save current state before navigation
        const apsSubjects: APSSubject[] = subjects.map((s) => ({
          name: s.name,
          marks: s.marks,
          level: s.points,
          points: s.points,
        }));

        // Synchronous save to localStorage for immediate persistence
        try {
          const profile = {
            subjects: apsSubjects,
            totalAPS: apsCalculation.totalAPS,
            lastUpdated: new Date().toISOString(),
            isValid: apsCalculation.isCalculationValid,
          };
          localStorage.setItem("userAPSProfile", JSON.stringify(profile));
        } catch (error) {
          console.warn("Failed to save APS profile before navigation:", error);
        }
      }
    };

    window.addEventListener("apsProfileCleared", handleAPSProfileCleared);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("apsProfileCleared", handleAPSProfileCleared);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [refreshProfile, clearError]);

  // Restore subjects when userProfile changes
  useEffect(() => {
    if (
      userProfile &&
      userProfile.subjects &&
      userProfile.subjects.length > 0
    ) {
      console.log("📥 Restoring APS subjects from saved profile:", userProfile);

      try {
        // Convert UserAPSProfile subjects to APSSubjectInput format for UI
        const restoredSubjects = userProfile.subjects
          .filter(
            (subject) =>
              subject && subject.name && typeof subject.marks === "number",
          )
          .map((subject) => ({
            name: subject.name.trim(),
            marks: Math.max(0, Math.min(100, subject.marks || 0)),
            level: subject.level || subject.points || 0,
            points:
              subject.points || convertPercentageToPoints(subject.marks || 0),
            isRequired: [
              "English",
              "Mathematics",
              "Mathematical Literacy",
              "Afrikaans",
              "Home Language",
              "First Additional Language",
            ].some((req) => subject.name.includes(req)),
          }));

        // Only update if we have valid subjects to restore
        if (restoredSubjects.length > 0) {
          setSubjects(restoredSubjects);
          console.log(
            "✅ APS subjects restored successfully:",
            restoredSubjects.length,
            "subjects",
          );
        } else {
          console.log("⚠️ No valid subjects found in profile to restore");
        }
      } catch (error) {
        console.error("❌ Error restoring APS subjects:", error);
        setSubjects([]);
      }
    } else if (userProfile === null) {
      console.log("📭 No APS profile found - starting fresh");
      setSubjects([]);
    } else {
      console.log("📭 APS profile exists but no subjects:", userProfile);
    }
  }, [userProfile]);

  // Auto-save subjects whenever they change (ensuring persistence)
  useEffect(() => {
    if (subjects.length > 0) {
      console.log(
        "🔄 Subjects changed, auto-saving to ensure persistence...",
        subjects.length,
      );

      // Convert to APS format and save
      const apsSubjects: APSSubject[] = subjects.map((s) => ({
        name: s.name,
        marks: s.marks,
        level: s.points,
        points: s.points,
      }));

      // Auto-save with a small delay to debounce rapid changes
      const timeoutId = setTimeout(async () => {
        await updateUserSubjects(apsSubjects);
        console.log("💾 Auto-save completed for", subjects.length, "subjects");
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [subjects, updateUserSubjects]);

  // Update validation messages
  useEffect(() => {
    try {
      // Extract messages from validation result
      const errorMessages = (apsCalculation.validationResult.errors || []).map(
        (error) =>
          typeof error === "string"
            ? error
            : error.message || "Validation error",
      );
      const warningMessages = (
        apsCalculation.validationResult.warnings || []
      ).map((warning) =>
        typeof warning === "string"
          ? warning
          : warning.message || "Validation warning",
      );

      setValidationErrors(errorMessages);
      setValidationWarnings(warningMessages);
    } catch (error) {
      console.error("Error processing validation messages:", error);
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  }, [apsCalculation.validationResult]);

  // Add subject function with immediate save
  const addSubject = useCallback(async () => {
    if (!selectedSubject || !selectedMarks) {
      toast.error("Please select a subject and enter marks");
      return;
    }

    const marks = parseFloat(selectedMarks);
    if (marks < 0 || marks > 100) {
      toast.error("Marks must be between 0 and 100");
      return;
    }

    // Normalize subject name for consistent naming
    const normalizedSubjectName = normalizeSubjectName(selectedSubject);

    // Check if subject already exists (check both original and normalized names)
    if (
      subjects.some(
        (s) => s.name === selectedSubject || s.name === normalizedSubjectName,
      )
    ) {
      toast.error("This subject has already been added");
      return;
    }

    const apsPoints = convertPercentageToPoints(marks);
    const newSubject: APSSubjectInput = {
      name: normalizedSubjectName, // Use normalized name for consistency
      marks,
      level: apsPoints, // Level should be the APS points (1-7)
      points: apsPoints, // Points should match level for consistency
      isRequired: ["English", "Mathematics", "Mathematical Literacy"].includes(
        normalizedSubjectName,
      ),
    };

    const newSubjects = [...subjects, newSubject];
    setSubjects(newSubjects);

    // Immediately save to profile to ensure persistence
    const apsSubjects: APSSubject[] = newSubjects.map((s) => ({
      name: s.name,
      marks: s.marks,
      level: s.points,
      points: s.points,
    }));

    const success = await updateUserSubjects(apsSubjects);

    if (success) {
      console.log("✅ Subject added and profile saved:", newSubject);
      setSelectedSubject("");
      setSelectedMarks("");
      toast.success("Subject added and saved");
    } else {
      console.warn("⚠️ Subject added but save failed");
      setSelectedSubject("");
      setSelectedMarks("");
      toast.success("Subject added");
    }
  }, [selectedSubject, selectedMarks, subjects, updateUserSubjects]);

  // Remove subject function with immediate save
  const removeSubject = useCallback(
    async (index: number) => {
      if (index < 0 || index >= subjects.length) {
        toast.error("Invalid subject index");
        return;
      }

      const subjectToRemove = subjects[index];
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);

      try {
        // Immediately save updated profile
        if (newSubjects.length > 0) {
          const apsSubjects: APSSubject[] = newSubjects.map((s) => ({
            name: s.name,
            marks: s.marks,
            level: s.points,
            points: s.points,
          }));
          const success = await updateUserSubjects(apsSubjects);

          if (success) {
            toast.success(
              `${subjectToRemove.name} removed and profile updated`,
            );
          } else {
            toast.success(`${subjectToRemove.name} removed`);
          }
        } else {
          // If no subjects left, clear the profile
          const success = await clearAPSProfile();
          if (success) {
            toast.success("Last subject removed and profile cleared");
          } else {
            toast.success("Subject removed");
          }
        }
      } catch (error) {
        console.error("Error removing subject:", error);
        toast.success("Subject removed");
      }
    },
    [subjects, updateUserSubjects, clearAPSProfile],
  );

  // Clear all subjects function with complete reset
  const clearAllSubjects = useCallback(() => {
    setSubjects([]);
    setSelectedSubject("");
    setSelectedMarks("");
    setSearchResults([]);
    setSelectedProgram(null);
    setIsDetailsModalOpen(false);
    setShowProgramsSection(false);
    clearError();
    toast.success("All data cleared");
  }, [clearError]);

  // Clear APS profile from all universities
  const handleClearAPSProfile = useCallback(async () => {
    try {
      const success = await clearAPSProfile();

      if (success) {
        setSubjects([]);
        setSelectedSubject("");
        setSelectedMarks("");
        setSearchResults([]);
        setSelectedProgram(null);
        setIsDetailsModalOpen(false);
        setShowProgramsSection(false);
        setUniversitySpecificScores(null);
        clearError();
        toast.success("APS profile cleared from all storage locations");
      } else {
        toast.error("Failed to clear APS profile completely");
      }
    } catch (error) {
      console.error("Error clearing APS profile:", error);
      toast.error("Error clearing APS profile");
    }
  }, [clearAPSProfile, clearError]);

  // Search programs function
  const searchPrograms = useCallback(async () => {
    if (!apsCalculation.isCalculationValid) {
      toast.error(
        "Please add at least 4 valid subjects with your English/Afrikaans and Mathematics/Mathematical Literacy",
      );
      return;
    }

    if (subjects.length < 4) {
      toast.error("Please add at least 4 subjects to search for programs");
      return;
    }

    try {
      // Ensure profile is saved before searching
      const apsSubjects: APSSubject[] = subjects.map((subject) => ({
        name: subject.name.trim(),
        marks: Math.max(0, Math.min(100, subject.marks)),
        level: subject.points,
        points: subject.points,
      }));

      console.log(
        "💾 Saving APS profile before program search...",
        apsSubjects,
      );
      const saveSuccess = await updateUserSubjects(apsSubjects);

      if (!saveSuccess) {
        console.warn("⚠️ Profile save failed, but continuing with search...");
      }

      // Search across all universities with better error handling
      const results = [];
      let successfulSearches = 0;
      let failedSearches = 0;

      for (const universityId of ALL_UNIVERSITY_IDS) {
        try {
          const universityResults =
            await searchCoursesForUniversity(universityId);
          if (universityResults && Array.isArray(universityResults)) {
            results.push(...universityResults);
            successfulSearches++;
          }
        } catch (err) {
          console.warn(`Failed to search courses for ${universityId}:`, err);
          failedSearches++;
        }
      }

      console.log(
        `🔍 Search completed: ${successfulSearches} successful, ${failedSearches} failed`,
      );

      setSearchResults(results);
      setShowProgramsSection(true);

      if (results.length > 0) {
        toast.success(
          `Found ${results.length} programs across ${successfulSearches} universities`,
        );
      } else {
        toast.warning(
          "No programs found. This might be due to very specific requirements or system issues.",
        );
      }
    } catch (err) {
      console.error("Error searching programs:", err);
      toast.error(
        "Failed to search programs. Please check your internet connection and try again.",
      );
    }
  }, [
    apsCalculation.isCalculationValid,
    subjects,
    updateUserSubjects,
    searchCoursesForUniversity,
  ]);

  // Get available faculties from search results
  const availableFaculties = useMemo(() => {
    const faculties = [
      ...new Set(searchResults.map((p) => p.faculty).filter(Boolean)),
    ];
    return faculties.sort();
  }, [searchResults]);

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    let filtered = searchResults;

    // Faculty filter
    if (facultyFilter && facultyFilter !== "all") {
      filtered = filtered.filter((p) => p.faculty === facultyFilter);
    }

    // Almost qualified filter
    if (!includeAlmostQualified) {
      filtered = filtered.filter((p) => p.eligible);
    }

    // Sort programs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "eligibility":
          if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
          return (a.apsGap || 0) - (b.apsGap || 0);
        case "aps":
          return (a.apsRequirement || 0) - (b.apsRequirement || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchResults, facultyFilter, includeAlmostQualified, sortBy]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const eligible = searchResults.filter((p) => p.eligible);
    const almostEligible = searchResults.filter(
      (p) => !p.eligible && p.apsGap <= maxAPSGap,
    );

    return {
      total: searchResults.length,
      eligible: eligible.length,
      almostEligible: almostEligible.length,
      eligibilityRate:
        searchResults.length > 0
          ? Math.round((eligible.length / searchResults.length) * 100)
          : 0,
    };
  }, [searchResults, maxAPSGap]);

  return (
    <div className="w-full space-y-8">
      {/* Clean Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-r from-book-50 to-blue-50 py-8 px-6 rounded-2xl">
        <div className="inline-flex items-center gap-2 bg-book-100 text-book-800 px-4 py-2 rounded-full text-sm font-medium">
          <Calculator className="w-4 h-4" />
          APS Calculator
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Calculate Your APS Score
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Enter your matric results to calculate your Admission Point Score and
          discover which university programs you qualify for across all 26 South
          African universities
        </p>
      </div>

      {/* APS Recovery Status */}
      <APSRecoveryStatus
        userProfile={userProfile}
        storageSource={storageSource || "none"}
        onRefresh={refreshProfile}
        className="max-w-4xl mx-auto"
      />

      {/* Alerts Section - Compact and Clean */}
      <div className="space-y-3">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearError}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-2">Please fix these issues:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationWarnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-medium mb-2">Recommendations:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* SECTION 1: APS OVERVIEW */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-book-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900">APS Overview</h2>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Main Content - Better Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Calculator Input Section */}
          <Card className="xl:col-span-2 bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                <BookOpen className="h-5 w-5 text-book-600" />
                Subject Results
              </CardTitle>
              <CardDescription>
                Add your matric subjects and marks to calculate your APS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Subject Form */}
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Subject
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Subject
                    </Label>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOUTH_AFRICAN_SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Final Mark (%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedMarks}
                      onChange={(e) => setSelectedMarks(e.target.value)}
                      placeholder="Enter your final mark"
                      className="bg-white"
                    />
                    {selectedMarks && (
                      <div className="text-sm text-book-600 font-medium">
                        Level{" "}
                        {convertPercentageToPoints(
                          parseFloat(selectedMarks) || 0,
                        )}
                        (
                        {convertPercentageToPoints(
                          parseFloat(selectedMarks) || 0,
                        )}{" "}
                        points)
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={addSubject}
                  disabled={!selectedSubject || !selectedMarks}
                  className="w-full bg-book-600 hover:bg-book-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {/* Added Subjects List */}
              {subjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Your Subjects ({subjects.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAllSubjects}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Clear All
                      </Button>
                      {hasValidProfile && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearAPSProfile}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Clear Profile
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {subject.name}
                            </span>
                            {subject.isRequired && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-book-100 text-book-800"
                              >
                                Core Subject
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{subject.marks}%</span>
                            <span>Level {subject.level}</span>
                            <span className="font-medium text-book-600">
                              {subject.points} points
                            </span>
                          </div>
                          {subject.name
                            .toLowerCase()
                            .includes("life orientation") && (
                            <span className="text-xs text-gray-500 italic">
                              Required but doesn't count towards APS
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSubject(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APS Score Display */}
              {subjects.length > 0 && (
                <div className="bg-gradient-to-br from-book-50 to-blue-50 p-6 rounded-xl border border-book-200">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <div
                        className={`text-4xl font-bold ${
                          apsCalculation.isCalculationValid
                            ? "text-book-700"
                            : "text-gray-600"
                        }`}
                      >
                        {apsCalculation.totalAPS}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        Your APS Score
                      </div>
                      {apsCalculation.totalAPS > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-book-100 text-book-800 border-book-200"
                        >
                          {getAPSScoreDescription(apsCalculation.totalAPS)}
                        </Badge>
                      )}
                    </div>

                    {apsCalculation.isCalculationValid && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Quality Score: {apsCalculation.validationResult.score}
                          %
                        </div>
                        <Button
                          onClick={searchPrograms}
                          className="w-full bg-book-600 hover:bg-book-700"
                          disabled={
                            isLoading || !apsCalculation.isCalculationValid
                          }
                          size="lg"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Target className="w-5 h-5 mr-2" />
                          )}
                          Find Your Programs
                        </Button>

                        {!apsCalculation.isCalculationValid &&
                          subjects.length > 0 && (
                            <div className="text-xs text-center text-gray-500 mt-2">
                              Add at least 4 subjects including
                              English/Afrikaans and Mathematics/Mathematical
                              Literacy
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Storage Status Indicator */}
              {subjects.length > 0 && (
                <APSStorageIndicator
                  storageSource={storageSource}
                  syncStatus={syncStatus}
                  isAuthenticated={false}
                  onRefresh={refreshProfile}
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* University Scores Section */}
          <div className="xl:col-span-3 space-y-6">
            {apsCalculation.isCalculationValid && universitySpecificScores && (
              <UniversitySpecificAPSDisplay
                universityScores={
                  universitySpecificScores.universitySpecificScores
                }
                standardAPS={apsCalculation.totalAPS}
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: ELIGIBLE PROGRAMS */}
      {showProgramsSection && searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-book-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Eligible Programs
            </h2>
            <div className="flex-1 h-px bg-gray-300"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProgramsSection(!showProgramsSection)}
              className="flex items-center gap-1"
            >
              {showProgramsSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showProgramsSection ? "Collapse" : "Expand"}
            </Button>
          </div>

          {/* Programs Section with Faculty Grouping */}
          <EligibleProgramsSection
            programs={filteredPrograms}
            statistics={statistics}
            availableFaculties={availableFaculties}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            includeAlmostQualified={includeAlmostQualified}
            setIncludeAlmostQualified={setIncludeAlmostQualified}
            onProgramSelect={(program) => {
              setSelectedProgram(program);
              setIsDetailsModalOpen(true);
            }}
            onRefresh={searchPrograms}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-green-800">
                {selectedProgram.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedProgram.universityName} • {selectedProgram.faculty}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Program Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Duration:</span>
                    <span>{selectedProgram.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">APS Required:</span>
                    <Badge variant="outline">
                      {selectedProgram.apsRequirement}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Campus:</span>
                    <span>{selectedProgram.universityName}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Eligibility:</span>
                    <Badge
                      variant={
                        selectedProgram.eligible ? "default" : "destructive"
                      }
                      className={
                        selectedProgram.eligible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedProgram.eligible ? "Qualified" : "Not Qualified"}
                    </Badge>
                  </div>
                  {!selectedProgram.eligible &&
                    "apsGap" in selectedProgram &&
                    (selectedProgram as { apsGap: number }).apsGap > 0 && (
                      <div className="text-yellow-700 text-sm mt-1">
                        You need{" "}
                        {(selectedProgram as { apsGap: number }).apsGap} more
                        APS points to qualify
                      </div>
                    )}
                </div>
              </div>

              {/* Subject Requirements */}
              {selectedProgram.subjects &&
                selectedProgram.subjects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-800">
                      Subject Requirements
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedProgram.subjects.map(
                        (
                          subject: { name: string; level?: number },
                          index: number,
                        ) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="font-medium">{subject.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  subject.isRequired ? "default" : "outline"
                                }
                              >
                                Level {subject.level}
                              </Badge>
                              {subject.isRequired && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Career Prospects */}
              {selectedProgram.careerProspects &&
                selectedProgram.careerProspects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-800">
                      Career Opportunities
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedProgram.careerProspects.map(
                        (career: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-green-50 rounded"
                          >
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{career}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() =>
                    navigate(`/university/${selectedProgram.universityId}`)
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Building className="h-4 w-4 mr-2" />
                  View University Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedAPSCalculator;
