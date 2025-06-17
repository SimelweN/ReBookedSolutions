import React, { useState, useMemo, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  BookOpen,
  Lightbulb,
  MapPin,
  Calendar,
  Brain,
  Trophy,
  Filter,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities";
import { SOUTH_AFRICAN_SUBJECTS } from "@/constants/subjects";
import { toast } from "sonner";
import APSTestComponent from "./APSTestComponent";

// Types
interface APSSubject {
  name: string;
  marks: number;
  level: number;
  points: number;
}

interface UniversityMatch {
  university: string;
  abbreviation: string;
  location: string;
  eligiblePrograms: number;
  totalPrograms: number;
  competitiveness: "High" | "Moderate" | "Accessible";
  averageAPS: number;
}

interface DegreeInsight {
  name: string;
  university: string;
  faculty: string;
  apsRequirement: number;
  duration: string;
  description: string;
  eligible: boolean;
  apsGap?: number;
  competitiveness: "High" | "Moderate" | "Accessible";
  careerProspects?: string[];
}

// Default subjects
const CORE_SUBJECTS: APSSubject[] = [
  { name: "English Home Language", marks: 0, level: 4, points: 0 },
  { name: "Mathematics", marks: 0, level: 4, points: 0 },
  { name: "Select Subject", marks: 0, level: 4, points: 0 },
  { name: "Select Subject", marks: 0, level: 4, points: 0 },
  { name: "Select Subject", marks: 0, level: 4, points: 0 },
  { name: "Select Subject", marks: 0, level: 4, points: 0 },
];

// Sample subjects with good marks
const SAMPLE_SUBJECTS: APSSubject[] = [
  { name: "English Home Language", marks: 75, level: 4, points: 6 },
  { name: "Mathematics", marks: 80, level: 4, points: 7 },
  { name: "Physical Sciences", marks: 70, level: 4, points: 6 },
  { name: "Life Sciences", marks: 65, level: 4, points: 5 },
  { name: "Geography", marks: 72, level: 4, points: 6 },
  {
    name: "Afrikaans First Additional Language",
    marks: 68,
    level: 4,
    points: 5,
  },
];

// APS calculation function
const calculateAPSPoints = (marks: number): number => {
  if (isNaN(marks) || marks < 0) return 0;
  if (marks >= 80) return 7;
  if (marks >= 70) return 6;
  if (marks >= 60) return 5;
  if (marks >= 50) return 4;
  if (marks >= 40) return 3;
  if (marks >= 30) return 2;
  return 1;
};

// Performance level
const getPerformanceLevel = (
  aps: number,
): { level: string; color: string; description: string } => {
  if (aps >= 36)
    return {
      level: "Outstanding",
      color: "text-purple-600 bg-purple-100",
      description: "Elite performance - access to any program",
    };
  if (aps >= 30)
    return {
      level: "Excellent",
      color: "text-emerald-600 bg-emerald-100",
      description: "Strong performance - most programs available",
    };
  if (aps >= 24)
    return {
      level: "Good",
      color: "text-blue-600 bg-blue-100",
      description: "Solid performance - many options available",
    };
  if (aps >= 18)
    return {
      level: "Fair",
      color: "text-orange-600 bg-orange-100",
      description: "Basic performance - limited options",
    };
  return {
    level: "Needs Improvement",
    color: "text-red-600 bg-red-100",
    description: "Consider improvement strategies",
  };
};

const WorkingAPSCalculator: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [subjects, setSubjects] = useState<APSSubject[]>(CORE_SUBJECTS);
  const [activeInsight, setActiveInsight] = useState<
    "overview" | "universities" | "programs"
  >("programs");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "eligible" | "competitive"
  >("all");
  const [showAllUniversities, setShowAllUniversities] = useState(false);

  // Calculate total APS
  const totalAPS = useMemo(() => {
    const total = subjects.reduce(
      (total, subject) => total + (subject.points || 0),
      0,
    );
    return isNaN(total) ? 0 : total;
  }, [subjects]);

  // Performance analysis
  const performance = useMemo(() => getPerformanceLevel(totalAPS), [totalAPS]);

  // Update subject marks
  const updateSubjectMarks = useCallback((index: number, marks: number) => {
    setSubjects((prevSubjects) => {
      const newSubjects = [...prevSubjects];
      newSubjects[index].marks = Math.max(0, Math.min(100, marks));
      newSubjects[index].points = calculateAPSPoints(newSubjects[index].marks);
      return newSubjects;
    });
  }, []);

  // Update subject name
  const updateSubjectName = useCallback((index: number, name: string) => {
    setSubjects((prevSubjects) => {
      const newSubjects = [...prevSubjects];
      newSubjects[index].name = name;
      return newSubjects;
    });
  }, []);

  // Available subjects
  const availableSubjects = useMemo(() => {
    return SOUTH_AFRICAN_SUBJECTS.filter(
      (subject) =>
        !subjects.some((s) => s.name === subject) || subject.includes("Select"),
    );
  }, [subjects]);

  // Comprehensive degree analysis using real university data
  const degreeAnalysis = useMemo(() => {
    const degrees: DegreeInsight[] = [];

    console.log(
      `🔍 APS Calculator: Analyzing ${ALL_SOUTH_AFRICAN_UNIVERSITIES.length} universities for APS ${totalAPS}`,
    );

    ALL_SOUTH_AFRICAN_UNIVERSITIES.forEach((university) => {
      const universityProgramCount =
        university.faculties?.reduce(
          (total, fac) => total + (fac.degrees?.length || 0),
          0,
        ) || 0;

      if (universityProgramCount === 0) {
        console.warn(`⚠️ ${university.name} has no programs!`);
      }

      university.faculties?.forEach((faculty) => {
        faculty.degrees?.forEach((degree) => {
          const eligible = totalAPS >= degree.apsRequirement;
          const apsGap = eligible ? 0 : degree.apsRequirement - totalAPS;

          let competitiveness: "High" | "Moderate" | "Accessible" =
            "Accessible";
          if (degree.apsRequirement >= 32) competitiveness = "High";
          else if (degree.apsRequirement >= 26) competitiveness = "Moderate";

          degrees.push({
            name: degree.name,
            university: university.name,
            faculty: faculty.name,
            apsRequirement: degree.apsRequirement,
            duration: degree.duration,
            description: degree.description,
            eligible,
            apsGap,
            competitiveness,
            careerProspects: degree.careerProspects || [],
          });
        });
      });
    });

    console.log(`📊 Found ${degrees.length} total programs`);
    if (totalAPS > 0) {
      const eligible = degrees.filter((d) => d.eligible).length;
      console.log(`✅ ${eligible} programs eligible for APS ${totalAPS}`);
    }

    return degrees.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      return a.apsRequirement - b.apsRequirement;
    });
  }, [totalAPS]);

  // University matches
  const universityMatches = useMemo(() => {
    const matches: UniversityMatch[] = [];

    ALL_SOUTH_AFRICAN_UNIVERSITIES.forEach((university) => {
      const totalPrograms =
        university.faculties?.reduce(
          (total, faculty) => total + (faculty.degrees?.length || 0),
          0,
        ) || 0;

      const eligiblePrograms =
        university.faculties?.reduce(
          (total, faculty) =>
            total +
            (faculty.degrees?.filter(
              (degree) => totalAPS >= degree.apsRequirement,
            ).length || 0),
          0,
        ) || 0;

      const allAPS =
        university.faculties?.flatMap(
          (faculty) =>
            faculty.degrees?.map((degree) => degree.apsRequirement) || [],
        ) || [];

      const averageAPS =
        allAPS.length > 0
          ? Math.round(
              allAPS.reduce((sum, aps) => sum + aps, 0) / allAPS.length,
            )
          : 0;

      let competitiveness: "High" | "Moderate" | "Accessible" = "Accessible";
      if (averageAPS >= 30) competitiveness = "High";
      else if (averageAPS >= 24) competitiveness = "Moderate";

      matches.push({
        university: university.name,
        abbreviation: university.abbreviation,
        location: `${university.location}, ${university.province}`,
        eligiblePrograms,
        totalPrograms,
        competitiveness,
        averageAPS,
      });
    });

    return matches.sort((a, b) => b.eligiblePrograms - a.eligiblePrograms);
  }, [totalAPS]);

  // Statistics
  const stats = useMemo(() => {
    const totalDegrees = degreeAnalysis.length;
    const eligibleCount =
      totalAPS > 0 ? degreeAnalysis.filter((d) => d.eligible).length : 0;
    const eligibilityRate =
      totalDegrees > 0 && totalAPS > 0
        ? Math.round((eligibleCount / totalDegrees) * 100)
        : 0;
    const topUniversities = universityMatches.filter(
      (u) => u.eligiblePrograms > 0,
    ).length;
    const averageRequirement =
      totalDegrees > 0
        ? Math.round(
            degreeAnalysis.reduce((sum, d) => sum + d.apsRequirement, 0) /
              totalDegrees,
          )
        : 0;

    return {
      totalDegrees,
      eligibleCount,
      eligibilityRate: isNaN(eligibilityRate) ? 0 : eligibilityRate,
      topUniversities,
      averageRequirement: isNaN(averageRequirement) ? 0 : averageRequirement,
      performancePercentile:
        isNaN(totalAPS) || totalAPS === 0
          ? 0
          : Math.min(100, Math.round((totalAPS / 42) * 100)),
    };
  }, [degreeAnalysis, universityMatches, totalAPS]);

  // Filter degrees
  const filteredDegrees = useMemo(() => {
    let filtered = degreeAnalysis;

    if (totalAPS === 0) {
      // Show a sample of programs when no APS is entered
      filtered = degreeAnalysis.slice(0, 20);
    } else {
      switch (selectedFilter) {
        case "eligible":
          filtered = filtered.filter((d) => d.eligible);
          break;
        case "competitive":
          filtered = filtered.filter((d) => d.competitiveness === "High");
          break;
        case "all":
        default:
          // Show all programs, but prioritize eligible ones
          break;
      }
    }

    return filtered.slice(0, 20);
  }, [degreeAnalysis, selectedFilter, totalAPS]);

  const handleReset = () => {
    setSubjects(CORE_SUBJECTS);
    toast.success("Calculator reset");
  };

  const handleLoadSample = () => {
    setSubjects(SAMPLE_SUBJECTS);
    toast.success("Sample marks loaded (APS: 35)");
    // Switch to programs tab to show results
    setActiveInsight("programs");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Data Status (Development Only) */}
      {import.meta.env.DEV && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <APSTestComponent />
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Professional APS Calculator
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Calculate your Admission Point Score and discover which university
              programs you qualify for. Enter your matric marks to see your
              eligibility across all South African universities.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
              <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {totalAPS}
              </div>
              <div className="text-slate-300 text-sm uppercase tracking-wider">
                Current APS
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {stats.eligibilityRate}%
              </div>
              <div className="text-slate-300 text-sm uppercase tracking-wider">
                Eligibility Rate
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
              <Building className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {stats.topUniversities}
              </div>
              <div className="text-slate-300 text-sm uppercase tracking-wider">
                Universities
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
              <GraduationCap className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {stats.eligibleCount}
              </div>
              <div className="text-slate-300 text-sm uppercase tracking-wider">
                Eligible Programs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Calculator */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">APS Calculator</div>
                    <div className="text-sm text-slate-500">
                      Enter your marks below
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-slate-700 font-medium">{`Subject ${index + 1}`}</Label>
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-start sm:items-center">
                      <div className="w-full sm:col-span-7">
                        <Select
                          value={subject.name}
                          onValueChange={(value) =>
                            updateSubjectName(index, value)
                          }
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200 w-full">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subject.name !== "Select Subject" && (
                              <SelectItem
                                key={`current-${subject.name}`}
                                value={subject.name}
                              >
                                {subject.name}
                              </SelectItem>
                            )}
                            {availableSubjects.map((availableSubject) => (
                              <SelectItem
                                key={availableSubject}
                                value={availableSubject}
                              >
                                {availableSubject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-full sm:col-span-5 gap-2 items-center">
                        <div className="flex-1 sm:flex-none sm:w-20">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={subject.marks}
                            onChange={(e) =>
                              updateSubjectMarks(
                                index,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-slate-50 border-slate-200 text-center font-medium"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                              subject.points >= 5
                                ? "bg-emerald-100 text-emerald-700"
                                : subject.points >= 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {subject.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* APS Result */}
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {totalAPS}
                    </div>
                    <div className="text-slate-600 mb-4">Total APS Score</div>
                    <Badge className={performance.color} variant="secondary">
                      {performance.level}
                    </Badge>
                    <div className="text-sm text-slate-600 mt-2">
                      {performance.description}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Performance Percentile
                      </span>
                      <span className="font-medium text-slate-900">
                        {stats.performancePercentile}%
                      </span>
                    </div>
                    <Progress
                      value={stats.performancePercentile}
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1 border-slate-200 hover:bg-slate-50"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleLoadSample}
                      variant="outline"
                      className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      Try Sample
                    </Button>
                  </div>
                  {totalAPS === 0 && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">
                        👆 Click "Try Sample" to see the calculator in action
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Strengths</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    {subjects.filter((s) => s.points >= 5).length > 0
                      ? `Strong performance in ${subjects.filter((s) => s.points >= 5).length} subjects`
                      : "Focus on improving individual subject performance"}
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      Opportunities
                    </span>
                  </div>
                  <div className="text-sm text-orange-800">
                    {totalAPS < 30
                      ? "Consider additional study resources and tutoring"
                      : "Explore advanced programs and specialized fields"}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-900">
                      Next Steps
                    </span>
                  </div>
                  <div className="text-sm text-emerald-800">
                    Explore {stats.eligibleCount} eligible programs and connect
                    with university advisors
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeInsight}
              onValueChange={(value) => setActiveInsight(value as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full mb-6 bg-white border border-slate-200 h-auto sm:h-10">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="universities"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Universities
                </TabsTrigger>
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Programs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="programs" className="space-y-6">
                {/* Filter Controls */}
                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Filter className="h-5 w-5 text-slate-600" />
                      Program Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant={
                          selectedFilter === "all" ? "default" : "outline"
                        }
                        onClick={() => setSelectedFilter("all")}
                        className={`w-full sm:w-auto ${selectedFilter === "all" ? "bg-slate-900 hover:bg-slate-800" : ""}`}
                        size="sm"
                      >
                        All Programs
                      </Button>
                      <Button
                        variant={
                          selectedFilter === "eligible" ? "default" : "outline"
                        }
                        onClick={() => setSelectedFilter("eligible")}
                        className={`w-full sm:w-auto ${selectedFilter === "eligible" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        size="sm"
                      >
                        Eligible Only
                      </Button>
                      <Button
                        variant={
                          selectedFilter === "competitive"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedFilter("competitive")}
                        className={`w-full sm:w-auto ${selectedFilter === "competitive" ? "bg-red-600 hover:bg-red-700" : ""}`}
                        size="sm"
                      >
                        Highly Competitive
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Results */}
                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-900">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                        {totalAPS === 0
                          ? "Available Programs"
                          : "Program Matches"}
                      </div>
                      <Badge variant="outline">
                        {filteredDegrees.length}{" "}
                        {totalAPS === 0 ? "samples" : "results"}
                      </Badge>
                    </CardTitle>
                    {totalAPS === 0 && (
                      <CardDescription className="text-slate-600">
                        Enter your marks above to see which programs you're
                        eligible for. Below is a sample of available programs.
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {filteredDegrees.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                          No Programs Available
                        </h3>
                        <p className="text-slate-500 mb-4">
                          {degreeAnalysis.length === 0
                            ? "There seems to be an issue loading university programs. Please refresh the page."
                            : totalAPS === 0
                              ? "Enter your marks above or try the sample data to see available programs."
                              : "No programs match your current criteria. Try adjusting your filters or improving your APS score."}
                        </p>
                        {totalAPS === 0 && (
                          <Button
                            onClick={handleLoadSample}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Load Sample Data
                          </Button>
                        )}
                        {degreeAnalysis.length === 0 && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">
                              Debug info: Total universities:{" "}
                              {ALL_SOUTH_AFRICAN_UNIVERSITIES.length}, Total
                              programs found: {degreeAnalysis.length}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDegrees.map((degree, index) => (
                          <div
                            key={index}
                            className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 mb-1">
                                  {degree.name}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  {degree.university} • {degree.faculty}
                                </p>
                                <p className="text-sm text-slate-700">
                                  {degree.description}
                                </p>
                              </div>
                              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                                <Badge
                                  variant={
                                    degree.eligible ? "default" : "destructive"
                                  }
                                  className={`${degree.eligible ? "bg-emerald-600 hover:bg-emerald-700" : ""} whitespace-nowrap`}
                                >
                                  APS {degree.apsRequirement}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "whitespace-nowrap",
                                    degree.competitiveness === "High"
                                      ? "border-red-200 text-red-700 bg-red-50"
                                      : degree.competitiveness === "Moderate"
                                        ? "border-orange-200 text-orange-700 bg-orange-50"
                                        : "border-green-200 text-green-700 bg-green-50",
                                  )}
                                >
                                  {degree.competitiveness}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Calendar className="h-3 w-3" />
                                  {degree.duration}
                                </span>
                                {degree.eligible ? (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle className="h-3 w-3" />
                                    Eligible
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    Need {degree.apsGap} more points
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50 w-full sm:w-auto justify-center sm:justify-start"
                              >
                                View Details
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="universities" className="space-y-6">
                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        University Matches
                      </div>
                      <Badge variant="outline">
                        {
                          universityMatches.filter(
                            (u) => u.eligiblePrograms > 0,
                          ).length
                        }{" "}
                        matches
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {universityMatches
                        .filter((u) => u.eligiblePrograms > 0)
                        .slice(0, 8)
                        .map((university, index) => (
                          <div
                            key={index}
                            className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building className="h-5 w-5 text-slate-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-slate-900 truncate">
                                      {university.university}
                                    </h4>
                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {university.location}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                  <span className="text-slate-600">
                                    <span className="font-medium text-emerald-600">
                                      {university.eligiblePrograms}
                                    </span>{" "}
                                    eligible programs
                                  </span>
                                  <span className="text-slate-600">
                                    Avg APS:{" "}
                                    <span className="font-medium">
                                      {university.averageAPS}
                                    </span>
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "w-fit",
                                      university.competitiveness === "High"
                                        ? "border-red-200 text-red-700 bg-red-50"
                                        : university.competitiveness ===
                                            "Moderate"
                                          ? "border-orange-200 text-orange-700 bg-orange-50"
                                          : "border-green-200 text-green-700 bg-green-50",
                                    )}
                                  >
                                    {university.competitiveness}
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 self-start sm:self-center" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Eligibility Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Programs</span>
                          <span className="text-xl font-bold text-slate-900">
                            {stats.totalDegrees}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">
                            {totalAPS === 0
                              ? "Enter APS to see eligible"
                              : "Eligible Programs"}
                          </span>
                          <span
                            className={`text-xl font-bold ${totalAPS === 0 ? "text-slate-400" : "text-emerald-600"}`}
                          >
                            {totalAPS === 0 ? "?" : stats.eligibleCount}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">
                              Eligibility Rate
                            </span>
                            <span className="font-medium">
                              {totalAPS === 0
                                ? "Calculate APS first"
                                : `${stats.eligibilityRate}%`}
                            </span>
                          </div>
                          <Progress
                            value={totalAPS === 0 ? 0 : stats.eligibilityRate}
                            className="h-3"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Your APS</span>
                          <span className="text-xl font-bold text-slate-900">
                            {totalAPS}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">
                            Average Required
                          </span>
                          <span className="text-xl font-bold text-slate-600">
                            {stats.averageRequirement}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">
                              Performance Level
                            </span>
                            <span className="font-medium">
                              {performance.level}
                            </span>
                          </div>
                          <Progress
                            value={
                              isNaN(totalAPS) || totalAPS === 0
                                ? 0
                                : Math.min(100, (totalAPS / 42) * 100)
                            }
                            className="h-3"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/university-info?tool=bursaries")}
          >
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                Find Bursaries
              </h3>
              <p className="text-sm text-slate-600">
                Discover funding opportunities for your studies
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/books")}
          >
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                Browse Textbooks
              </h3>
              <p className="text-sm text-slate-600">
                Find books for your chosen programs
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/university-info")}
          >
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                University Guide
              </h3>
              <p className="text-sm text-slate-600">
                Explore universities and programs in detail
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkingAPSCalculator;
