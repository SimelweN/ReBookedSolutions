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
  Filter,
  Calendar,
  Trophy,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SOUTH_AFRICAN_SUBJECTS } from "@/constants/subjects";
import { toast } from "sonner";
import {
  extractUniversityPrograms,
  calculateAPSTotal,
  analyzeDegreeEligibility,
  groupProgramsByUniversity,
  calculateUniversityStats,
  calculateOverallStats,
  filterPrograms,
  UniversityProgramExtended,
} from "@/utils/apsCalculatorUtils";
import { FALLBACK_PROGRAMS } from "@/constants/universityPrograms";

// Get university programs data lazily
const getUniversityPrograms = () => {
  try {
    return extractUniversityPrograms();
  } catch (error) {
    console.warn(
      "Failed to extract university programs, using fallback",
      error,
    );
    return [];
  }
};

// Use real data if available, otherwise fallback (lazy evaluation)
const getFinalUniversityPrograms = () => {
  const UNIVERSITY_PROGRAMS = getUniversityPrograms();
  return UNIVERSITY_PROGRAMS.length > 0
    ? UNIVERSITY_PROGRAMS
    : FALLBACK_PROGRAMS.map((program, index) => ({
        ...program,
        id: `fallback-${index}`,
        name: program.program,
        apsRequired: program.aps,
        universityId: program.abbreviation.toLowerCase(),
      }));
};

// Types
interface APSSubject {
  name: string;
  marks: number;
  level: number;
  points: number;
}

interface DegreeInsight {
  id: string;
  name: string;
  apsRequirement: number;
  eligible: boolean;
  apsGap: number;
  overqualified: boolean;
  university: string;
  faculty: string;
  duration: string;
  description: string;
  location: string;
}

// Initial subjects setup
const createInitialSubjects = (): APSSubject[] => [
  { name: "Mathematics", marks: 0, level: 4, points: 0 },
  { name: "English", marks: 0, level: 4, points: 0 },
  { name: "Life Sciences", marks: 0, level: 4, points: 0 },
  { name: "Physical Sciences", marks: 0, level: 4, points: 0 },
  { name: "History", marks: 0, level: 4, points: 0 },
  { name: "Geography", marks: 0, level: 4, points: 0 },
  { name: "Select Subject", marks: 0, level: 4, points: 0 },
];

// Calculate APS points for a subject
const calculateSubjectPoints = (marks: number): number => {
  if (marks >= 80) return 7;
  if (marks >= 70) return 6;
  if (marks >= 60) return 5;
  if (marks >= 50) return 4;
  if (marks >= 40) return 3;
  if (marks >= 30) return 2;
  return 1;
};

const SimpleAPSCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<APSSubject[]>(createInitialSubjects);
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedFilters, setSelectedFilters] = useState({
    faculty: "",
    university: "",
    minAPS: "",
    maxAPS: "",
  });

  // Calculate total APS
  const totalAPS = useMemo(() => {
    const filledSubjects = subjects.filter(
      (s) => s.name !== "Select Subject" && s.marks > 0,
    );
    if (filledSubjects.length < 6) return 0;

    return filledSubjects.reduce((total, subject) => {
      const points = calculateSubjectPoints(subject.marks);
      return total + points;
    }, 0);
  }, [subjects]);

  // Update subject marks
  const updateSubjectMarks = useCallback((index: number, marks: number) => {
    setSubjects((prevSubjects) => {
      const newSubjects = [...prevSubjects];
      newSubjects[index].marks = Math.max(0, Math.min(100, marks));
      newSubjects[index].points = calculateSubjectPoints(
        newSubjects[index].marks,
      );
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

  // Analyze degrees for eligibility
  const degreeAnalysis = useMemo(() => {
    const degrees: DegreeInsight[] = [];

    getFinalUniversityPrograms().forEach((program) => {
      degrees.push({
        id: program.id || `${program.universityId}-${program.name}`,
        name: program.name || program.program,
        apsRequirement: program.apsRequired || program.aps,
        eligible: totalAPS >= (program.apsRequired || program.aps),
        apsGap: Math.max(0, (program.apsRequired || program.aps) - totalAPS),
        overqualified: totalAPS > (program.apsRequired || program.aps) + 5,
        university: program.university,
        faculty: program.faculty,
        duration: program.duration,
        description: program.description,
        location: program.location,
      });
    });

    return degrees.sort((a, b) => {
      if (totalAPS === 0) return a.apsRequirement - b.apsRequirement;
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      if (a.eligible && b.eligible) return a.apsRequirement - b.apsRequirement;
      return a.apsGap - b.apsGap;
    });
  }, [totalAPS]);

  // Group by university
  const universityMatches = useMemo(() => {
    const groupedPrograms = groupProgramsByUniversity(
      getFinalUniversityPrograms() as UniversityProgramExtended[],
    );
    return calculateUniversityStats(groupedPrograms, totalAPS);
  }, [totalAPS]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateOverallStats(degreeAnalysis, universityMatches, totalAPS);
  }, [degreeAnalysis, universityMatches, totalAPS]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return filterPrograms(
      degreeAnalysis.map(
        (d) =>
          ({
            ...d,
            program: d.name,
            aps: d.apsRequirement,
            abbreviation: "", // Add if needed
          }) as UniversityProgramExtended,
      ),
      {
        searchTerm: "",
        faculty: selectedFilters.faculty || undefined,
        university: selectedFilters.university || undefined,
        minAPS: selectedFilters.minAPS
          ? parseInt(selectedFilters.minAPS)
          : undefined,
        maxAPS: selectedFilters.maxAPS
          ? parseInt(selectedFilters.maxAPS)
          : undefined,
      },
    );
  }, [degreeAnalysis, selectedFilters]);

  // Get unique faculties and universities for filters
  const uniqueFaculties = [
    ...new Set(degreeAnalysis.map((d) => d.faculty)),
  ].sort();
  const uniqueUniversities = [
    ...new Set(degreeAnalysis.map((d) => d.university)),
  ].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Calculator className="h-4 w-4 text-blue-300" />
              <span className="text-sm text-white/90 font-medium">
                APS Calculator & University Matcher
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Discover Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}
                University Path
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Calculate your APS score and explore thousands of degree programs
              across South African universities. Make informed decisions about
              your future with comprehensive program insights and eligibility
              analysis.
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
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  APS Calculator
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Enter your subject marks to calculate your APS score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white">
                        {subject.name === "Select Subject" ? (
                          <Select
                            onValueChange={(value) =>
                              updateSubjectName(index, value)
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {SOUTH_AFRICAN_SUBJECTS.map((subj) => (
                                <SelectItem key={subj} value={subj}>
                                  {subj}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{subject.name}</span>
                        )}
                      </Label>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-300"
                      >
                        {subject.points} pts
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.marks || ""}
                      onChange={(e) =>
                        updateSubjectMarks(index, parseInt(e.target.value) || 0)
                      }
                      placeholder="Enter marks (%)"
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      Total APS Score
                    </span>
                    <span className="text-2xl font-bold text-blue-400">
                      {totalAPS}
                    </span>
                  </div>
                  <Progress
                    value={(totalAPS / 42) * 100}
                    className="h-2 bg-white/10"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum possible: 42 points
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
                <TabsTrigger
                  value="calculator"
                  className="data-[state=active]:bg-blue-600"
                >
                  Programs
                </TabsTrigger>
                <TabsTrigger
                  value="universities"
                  className="data-[state=active]:bg-blue-600"
                >
                  Universities
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="data-[state=active]:bg-blue-600"
                >
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-4">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Degree Programs
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      {totalAPS > 0
                        ? `Showing ${stats.eligibleCount} eligible programs out of ${stats.totalDegrees} total`
                        : `Browse ${stats.totalDegrees} available degree programs`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {degreeAnalysis.slice(0, 20).map((program) => (
                        <div
                          key={program.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            program.eligible
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-white/5 border-white/10",
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-white">
                                {program.name}
                              </h3>
                              <p className="text-sm text-slate-300">
                                {program.university}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  program.eligible ? "default" : "secondary"
                                }
                                className={
                                  program.eligible ? "bg-green-600" : ""
                                }
                              >
                                {program.apsRequirement} APS
                              </Badge>
                              {program.eligible && (
                                <CheckCircle className="h-4 w-4 text-green-400 mt-1 ml-auto" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">
                            {program.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{program.faculty}</span>
                            <span>{program.duration}</span>
                            <span>{program.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="universities" className="space-y-4">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      University Matches
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Universities ranked by your eligibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {universityMatches.slice(0, 10).map((uni, index) => (
                        <div
                          key={uni.abbreviation}
                          className="p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-white">
                                {uni.university}
                              </h3>
                              <p className="text-sm text-slate-300">
                                {uni.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-400">
                                {uni.eligiblePrograms}
                              </div>
                              <div className="text-xs text-slate-400">
                                eligible programs
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Avg APS: {uni.averageAPS}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                uni.competitiveness === "High" &&
                                  "border-red-500 text-red-400",
                                uni.competitiveness === "Moderate" &&
                                  "border-yellow-500 text-yellow-400",
                                uni.competitiveness === "Accessible" &&
                                  "border-green-500 text-green-400",
                              )}
                            >
                              {uni.competitiveness}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Performance Insights
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Analysis of your APS performance and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <h4 className="font-medium text-blue-300 mb-2">
                          Performance Level
                        </h4>
                        <p className="text-2xl font-bold text-white">
                          {stats.performancePercentile}%
                        </p>
                        <p className="text-xs text-blue-200">
                          Of maximum possible APS
                        </p>
                      </div>
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <h4 className="font-medium text-purple-300 mb-2">
                          Eligible Universities
                        </h4>
                        <p className="text-2xl font-bold text-white">
                          {stats.topUniversities}
                        </p>
                        <p className="text-xs text-purple-200">
                          With available programs
                        </p>
                      </div>
                    </div>

                    {totalAPS > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">
                          Recommendations
                        </h4>
                        {stats.performancePercentile >= 90 && (
                          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                            <p className="text-green-300 text-sm">
                              🎉 Excellent performance! You qualify for highly
                              competitive programs including medicine,
                              engineering, and top-tier business programs.
                            </p>
                          </div>
                        )}
                        {stats.performancePercentile >= 70 &&
                          stats.performancePercentile < 90 && (
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                              <p className="text-blue-300 text-sm">
                                👍 Strong performance! You have access to most
                                university programs. Consider applying to your
                                preferred institutions.
                              </p>
                            </div>
                          )}
                        {stats.performancePercentile < 70 && (
                          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                            <p className="text-yellow-300 text-sm">
                              💡 Good foundation! Focus on universities of
                              technology and comprehensive universities that
                              offer excellent career-focused programs.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAPSCalculator;
