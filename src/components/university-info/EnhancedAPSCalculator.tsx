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
import UniversitySpecificAPSDisplay from "./UniversitySpecificAPSDisplay";

/**
 * Enhanced APS Calculator addressing critical filtering and validation issues
 * Fixes problems: No APS filtering, silent failures, poor validation, UI issues
 */

interface APSSubjectInput {
  name: string;
  marks: number;
  level: number;
  points: number;
  isRequired: boolean;
}

interface ProgramEligibilityDisplay {
  program: any;
  isEligible: boolean;
  apsGap: number;
  subjectMatch: {
    hasRequiredSubjects: boolean;
    missingSubjects: string[];
    score: number;
  };
  competitiveness: "Low" | "Moderate" | "High";
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
    updateUserSubjects,
    searchCoursesForUniversity,
    checkProgramEligibility,
    clearError,
  } = useAPSAwareCourseAssignment();

  const {
    filterOptions,
    includeAlmostQualified,
    setIncludeAlmostQualified,
    maxAPSGap,
    setMaxAPSGap,
    facultyFilter,
    setFacultyFilter,
    sortBy,
    setSortBy,
  } = useAPSFilterOptions();

  // Local state for APS calculation
  const [subjects, setSubjects] = useState<APSSubjectInput[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMarks, setSelectedMarks] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Enhanced APS calculation with comprehensive validation
  const apsCalculation = useMemo(() => {
    try {
      if (subjects.length === 0) {
        return {
          totalAPS: 0,
          contributingSubjects: [],
          validationResult: {
            isValid: true,
            errors: [],
            warnings: [],
            score: 100,
          },
          isCalculationValid: false,
        };
      }

      // Convert to standard APSSubject format
      const apsSubjects: APSSubject[] = subjects.map((s) => ({
        name: s.name,
        marks: s.marks,
        level: s.level,
        points: s.points,
      }));

      // Comprehensive validation
      const validationResult = validateAPSSubjectsEnhanced(apsSubjects);

      // Calculate APS using enhanced logic
      const calculation = calculateAPS(apsSubjects);

      // Filter out Life Orientation for APS total
      const contributingSubjects = subjects.filter(
        (s) => !s.name.toLowerCase().includes("life orientation"),
      );

      const totalAPS = contributingSubjects.reduce(
        (sum, s) => sum + s.points,
        0,
      );

      return {
        totalAPS,
        contributingSubjects,
        validationResult,
        isCalculationValid: validationResult.isValid && totalAPS > 0,
        fullCalculation: calculation,
      };
    } catch (err) {
      console.error("APS Calculation Error:", err);
      return {
        totalAPS: 0,
        contributingSubjects: [],
        validationResult: {
          isValid: false,
          errors: [`Calculation error: ${err}`],
          warnings: [],
          score: 0,
        },
        isCalculationValid: false,
      };
    }
  }, [subjects]);

  // Update validation errors when calculation changes
  useEffect(() => {
    // Extract message strings from validation error objects with safety checks
    const errors = apsCalculation.validationResult?.errors || [];
    const warnings = apsCalculation.validationResult?.warnings || [];

    const errorMessages = errors.map((error) =>
      typeof error === "string" ? error : error?.message || "Unknown error",
    );
    const warningMessages = warnings.map((warning) =>
      typeof warning === "string"
        ? warning
        : warning?.message || "Unknown warning",
    );

    setValidationErrors(errorMessages);
    setValidationWarnings(warningMessages);
  }, [apsCalculation.validationResult]);

  // Sync with global APS profile when calculation is valid
  useEffect(() => {
    if (apsCalculation.isCalculationValid && apsCalculation.fullCalculation) {
      updateUserSubjects(apsCalculation.fullCalculation.subjects);
    }
  }, [
    apsCalculation.isCalculationValid,
    apsCalculation.fullCalculation,
    updateUserSubjects,
  ]);

  // Enhanced subject addition with validation
  const addSubject = useCallback(() => {
    try {
      clearError();

      if (!selectedSubject || !selectedMarks) {
        toast.error("Please select a subject and enter marks");
        return;
      }

      const marks = parseFloat(selectedMarks);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        toast.error("Marks must be between 0 and 100");
        return;
      }

      // Check for duplicates
      const existingIndex = subjects.findIndex(
        (s) => s.name === selectedSubject,
      );
      if (existingIndex >= 0) {
        toast.error("Subject already added. Remove it first to update.");
        return;
      }

      // Calculate level and points
      const points = convertPercentageToPoints(marks);
      const level = points; // In South African system, level often equals points

      // Determine if subject is typically required
      const isRequired = [
        "English",
        "Mathematics",
        "Mathematical Literacy",
      ].some((req) =>
        selectedSubject.toLowerCase().includes(req.toLowerCase()),
      );

      const newSubject: APSSubjectInput = {
        name: selectedSubject,
        marks,
        level,
        points,
        isRequired,
      };

      setSubjects((prev) => [...prev, newSubject]);
      setSelectedSubject("");
      setSelectedMarks("");

      toast.success(`Added ${selectedSubject} (${marks}% = ${points} points)`);
    } catch (err) {
      toast.error(`Error adding subject: ${err}`);
    }
  }, [selectedSubject, selectedMarks, subjects, clearError]);

  // Enhanced subject removal
  const removeSubject = useCallback(
    (index: number) => {
      try {
        const subject = subjects[index];
        setSubjects((prev) => prev.filter((_, i) => i !== index));
        toast.success(`Removed ${subject.name}`);
      } catch (err) {
        toast.error(`Error removing subject: ${err}`);
      }
    },
    [subjects],
  );

  // Clear all subjects
  const clearAllSubjects = useCallback(() => {
    setSubjects([]);
    setValidationErrors([]);
    setValidationWarnings([]);
    toast.success("All subjects cleared");
  }, []);

  // Enhanced program search across universities
  const searchPrograms = useCallback(async () => {
    if (!apsCalculation.isCalculationValid) {
      toast.error("Please add valid subjects first");
      return;
    }

    try {
      setSearchResults([]);

      // Search across major universities
      const universityIds = ["uct", "wits", "stellenbosch", "up", "ukzn"];
      const allResults: any[] = [];

      for (const universityId of universityIds) {
        const result = await searchCoursesForUniversity(universityId, {
          ...filterOptions,
          userAPS: apsCalculation.totalAPS,
        });

        if (result.courses) {
          allResults.push(
            ...result.courses.map((course) => ({
              ...course,
              universityId,
              eligible: course.isEligible,
              apsGap: course.apsGap,
            })),
          );
        }
      }

      // Sort by eligibility and APS requirement
      allResults.sort((a, b) => {
        if (a.eligible && !b.eligible) return -1;
        if (!a.eligible && b.eligible) return 1;
        return (a.defaultAps || 0) - (b.defaultAps || 0);
      });

      setSearchResults(allResults);
      toast.success(`Found ${allResults.length} programs across universities`);
    } catch (err) {
      toast.error(`Search error: ${err}`);
    }
  }, [
    apsCalculation.isCalculationValid,
    apsCalculation.totalAPS,
    filterOptions,
    searchCoursesForUniversity,
  ]);

  // Enhanced program details modal
  const handleViewDetails = useCallback((program: any) => {
    setSelectedProgram(program);
    setIsDetailsModalOpen(true);
  }, []);

  // Get available faculties from search results
  const availableFaculties = useMemo(() => {
    return [...new Set(searchResults.map((p) => p.faculty))].sort();
  }, [searchResults]);

  // Filter and sort search results
  const filteredResults = useMemo(() => {
    let filtered = searchResults;

    // Apply faculty filter
    if (facultyFilter !== "all") {
      filtered = filtered.filter((p) => p.faculty === facultyFilter);
    }

    // Apply APS filtering
    if (!includeAlmostQualified) {
      filtered = filtered.filter((p) => p.eligible);
    }

    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === "eligibility") {
        if (a.eligible && !b.eligible) return -1;
        if (!a.eligible && b.eligible) return 1;
      } else if (sortBy === "aps") {
        return (a.defaultAps || 0) - (b.defaultAps || 0);
      }
      return a.name?.localeCompare(b.name) || 0;
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
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
          Enhanced APS Calculator & Program Explorer
        </h1>
        <p className="text-lg text-slate-600 max-w-4xl mx-auto">
          Calculate your Admission Point Score with comprehensive validation and
          discover programs you qualify for across South African universities.
          Now with enhanced filtering and error handling.
        </p>
      </div>

      {/* Error Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              size="sm"
              variant="ghost"
              onClick={clearError}
              className="ml-2 h-auto p-1 text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Validation Errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">Validation Warnings:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationWarnings.map((warning, i) => (
                <li key={i} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced APS Calculator Card */}
        <Card className="lg:col-span-1 bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <Calculator className="h-5 w-5 text-green-600" />
              Calculate Your APS
            </CardTitle>
            <CardDescription>
              Enter your matric subject results to calculate your Admission
              Point Score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Select Subject
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
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

            {/* Marks Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Final Mark (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={selectedMarks}
                onChange={(e) => setSelectedMarks(e.target.value)}
                placeholder="Enter your final mark"
              />
              {selectedMarks && (
                <div className="text-sm text-slate-600">
                  Level{" "}
                  {convertPercentageToPoints(parseFloat(selectedMarks) || 0)}(
                  {convertPercentageToPoints(parseFloat(selectedMarks) || 0)}{" "}
                  points)
                </div>
              )}
            </div>

            <Button
              onClick={addSubject}
              disabled={!selectedSubject || !selectedMarks}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>

            {/* Added Subjects */}
            {subjects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">
                    Your Subjects ({subjects.length})
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAllSubjects}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {subject.name}
                          </span>
                          {subject.isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {subject.marks}% = Level {subject.level} (
                          {subject.points} points)
                        </span>
                        {subject.name
                          .toLowerCase()
                          .includes("life orientation") && (
                          <span className="text-xs text-slate-500">
                            (Required but doesn't count for APS)
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSubject(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced APS Display */}
            <div
              className={`p-4 rounded-lg border-2 ${
                apsCalculation.isCalculationValid
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${
                    apsCalculation.isCalculationValid
                      ? "text-green-800"
                      : "text-slate-600"
                  }`}
                >
                  {apsCalculation.totalAPS}
                </div>
                <div
                  className={`text-sm ${
                    apsCalculation.isCalculationValid
                      ? "text-green-600"
                      : "text-slate-500"
                  }`}
                >
                  Total APS Score
                </div>
                {apsCalculation.totalAPS > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    {getAPSScoreDescription(apsCalculation.totalAPS)}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  Quality Score: {apsCalculation.validationResult.score}%
                </div>
              </div>

              {apsCalculation.isCalculationValid && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <Button
                    onClick={searchPrograms}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Find Eligible Programs
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* University-Specific APS Scoring Display */}
        {apsCalculation.isCalculationValid &&
          apsCalculation.fullCalculation?.universitySpecificScores && (
            <UniversitySpecificAPSDisplay
              universityScores={
                apsCalculation.fullCalculation.universitySpecificScores
              }
              standardAPS={apsCalculation.totalAPS}
              className="lg:col-span-3"
            />
          )}

        {/* Enhanced Results Card */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                  <Target className="h-5 w-5 text-green-600" />
                  Your Program Results
                </CardTitle>
                <CardDescription>
                  {apsCalculation.isCalculationValid
                    ? `Programs across universities for APS ${apsCalculation.totalAPS}`
                    : "Add your subjects to see program recommendations"}
                </CardDescription>
              </div>

              {/* Enhanced Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
                {searchResults.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={searchPrograms}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Faculty
                  </Label>
                  <Select
                    value={facultyFilter}
                    onValueChange={setFacultyFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Faculties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculties</SelectItem>
                      {availableFaculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Sort By
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eligibility">Eligibility</SelectItem>
                      <SelectItem value="aps">APS Requirement</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={includeAlmostQualified}
                      onCheckedChange={setIncludeAlmostQualified}
                    />
                    <Label className="text-sm">Show almost eligible</Label>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {!apsCalculation.isCalculationValid ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Add your subjects to get started
                </h3>
                <p className="text-slate-500">
                  Enter at least 4 matric subjects to see which programs you
                  qualify for
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Click "Find Eligible Programs" to search
                </h3>
                <p className="text-slate-500">
                  We'll search across major universities to find programs you
                  qualify for
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">
                      {statistics.eligible}
                    </div>
                    <div className="text-sm text-green-600">Eligible</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-800">
                      {statistics.almostEligible}
                    </div>
                    <div className="text-sm text-yellow-600">
                      Almost Eligible
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">
                      {statistics.total}
                    </div>
                    <div className="text-sm text-blue-600">Total Found</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">
                      {statistics.eligibilityRate}%
                    </div>
                    <div className="text-sm text-purple-600">Success Rate</div>
                  </div>
                </div>

                {/* Results List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredResults.map((program, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        program.eligible
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">
                              {program.name}
                            </h4>
                            {program.eligible && (
                              <Badge className="bg-green-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Eligible
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {program.universityInfo?.name ||
                              "Unknown University"}{" "}
                            • {program.faculty}
                          </p>
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {program.description}
                          </p>
                          {!program.eligible && program.apsGap > 0 && (
                            <p className="text-sm text-yellow-600 mt-1">
                              Need {program.apsGap} more APS points to qualify
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={program.eligible ? "default" : "secondary"}
                            className={program.eligible ? "bg-green-600" : ""}
                          >
                            APS {program.defaultAps || "N/A"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(program)}
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredResults.length === 0 && searchResults.length > 0 && (
                  <div className="text-center py-8">
                    <Filter className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">
                      No programs match your current filters. Try adjusting your
                      criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 text-green-600" />
                {selectedProgram.name}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {selectedProgram.universityInfo?.name || "University"} •{" "}
                {selectedProgram.faculty}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Program Overview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-green-800">
                  Program Overview
                </h3>
                <p className="text-slate-600">{selectedProgram.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      Duration: {selectedProgram.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      APS Required: {selectedProgram.defaultAps}
                    </span>
                  </div>
                </div>

                {/* Eligibility Status */}
                <div
                  className={`p-3 rounded-lg ${
                    selectedProgram.eligible
                      ? "bg-green-50 border border-green-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div
                    className={`font-medium ${
                      selectedProgram.eligible
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {selectedProgram.eligible
                      ? "You qualify for this program!"
                      : "You don't currently qualify"}
                  </div>
                  {!selectedProgram.eligible && selectedProgram.apsGap > 0 && (
                    <div className="text-yellow-700 text-sm mt-1">
                      You need {selectedProgram.apsGap} more APS points to
                      qualify
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
                        (subject: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-slate-50 rounded"
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
