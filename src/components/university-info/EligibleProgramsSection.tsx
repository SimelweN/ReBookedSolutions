import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Building,
  Clock,
  Users,
  Trophy,
  BarChart3,
  Eye,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Loader2,
  Star,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Program {
  id: string;
  name: string;
  faculty: string;
  universityName: string;
  universityId: string;
  duration: string;
  apsRequirement: number;
  eligible: boolean;
  apsGap?: number;
  subjects?: Array<{
    name: string;
    level: number;
    isRequired: boolean;
  }>;
  careerProspects?: string[];
  description?: string;
}

interface Statistics {
  total: number;
  eligible: number;
  almostEligible: number;
  eligibilityRate: number;
}

interface EligibleProgramsSectionProps {
  programs: Program[];
  statistics: Statistics;
  availableFaculties: string[];
  facultyFilter: string;
  setFacultyFilter: (faculty: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  includeAlmostQualified: boolean;
  setIncludeAlmostQualified: (include: boolean) => void;
  onProgramSelect: (program: Program) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const EligibleProgramsSection: React.FC<EligibleProgramsSectionProps> = ({
  programs,
  statistics,
  availableFaculties,
  facultyFilter,
  setFacultyFilter,
  sortBy,
  setSortBy,
  includeAlmostQualified,
  setIncludeAlmostQualified,
  onProgramSelect,
  onRefresh,
  isLoading,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFacultyTab, setSelectedFacultyTab] = useState<string>("all");

  // Group programs by faculty
  const programsByFaculty = useMemo(() => {
    const grouped: Record<string, Program[]> = {};

    programs.forEach((program) => {
      const faculty = program.faculty || "Other";
      if (!grouped[faculty]) {
        grouped[faculty] = [];
      }
      grouped[faculty].push(program);
    });

    // Sort faculties alphabetically
    const sortedFaculties = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, Program[]> = {};

    sortedFaculties.forEach((faculty) => {
      sortedGrouped[faculty] = grouped[faculty];
    });

    return sortedGrouped;
  }, [programs]);

  // Get faculty counts
  const facultyCounts = useMemo(() => {
    const counts: Record<string, { total: number; eligible: number }> = {};

    Object.entries(programsByFaculty).forEach(([faculty, facultyPrograms]) => {
      counts[faculty] = {
        total: facultyPrograms.length,
        eligible: facultyPrograms.filter((p) => p.eligible).length,
      };
    });

    return counts;
  }, [programsByFaculty]);

  // Get filtered programs based on selected faculty tab
  const displayedPrograms = useMemo(() => {
    if (selectedFacultyTab === "all") {
      return programs;
    }
    return programsByFaculty[selectedFacultyTab] || [];
  }, [programs, programsByFaculty, selectedFacultyTab]);

  const ProgramCard: React.FC<{ program: Program }> = ({ program }) => {
    const eligibilityColor = program.eligible
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";

    const apsGapColor =
      program.apsGap && program.apsGap <= 3
        ? "text-yellow-600"
        : "text-red-600";

    return (
      <Card
        className="transition-all duration-200 hover:shadow-md cursor-pointer border"
        onClick={() => onProgramSelect(program)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 line-clamp-2">
                {program.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building className="h-3 w-3" />
                {program.universityName}
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {program.faculty}
                </Badge>
              </CardDescription>
            </div>
            <Badge className={cn("ml-2", eligibilityColor)} variant="outline">
              {program.eligible ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {program.eligible ? "Qualified" : "Not Qualified"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Program Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <BarChart3 className="h-3 w-3" />
                <span>APS: {program.apsRequirement}</span>
              </div>
            </div>

            {/* APS Gap Warning */}
            {!program.eligible && program.apsGap && program.apsGap > 0 && (
              <div className={`text-sm ${apsGapColor} flex items-center gap-1`}>
                <AlertTriangle className="h-3 w-3" />
                <span>Need {program.apsGap} more APS points</span>
              </div>
            )}

            {/* Subject Requirements Preview */}
            {program.subjects && program.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {program.subjects.slice(0, 3).map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {subject.name}: L{subject.level}
                  </Badge>
                ))}
                {program.subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{program.subjects.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              size="sm"
              className="w-full"
              variant={program.eligible ? "default" : "outline"}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Target className="h-5 w-5 text-book-600" />
              Program Search Results
            </CardTitle>
            <CardDescription>
              Programs you may qualify for organized by faculty
            </CardDescription>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mt-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Faculty Filter
              </Label>
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
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

            <div className="flex items-center space-x-2">
              <Switch
                id="almost-qualified"
                checked={includeAlmostQualified}
                onCheckedChange={setIncludeAlmostQualified}
              />
              <Label htmlFor="almost-qualified" className="text-sm">
                Include Almost Qualified
              </Label>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-800">
              {statistics.eligible}
            </div>
            <div className="text-sm text-green-600">Eligible</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-800">
              {statistics.almostEligible}
            </div>
            <div className="text-sm text-yellow-600">Almost Eligible</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-800">
              {statistics.total}
            </div>
            <div className="text-sm text-blue-600">Total Found</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-800">
              {statistics.eligibilityRate}%
            </div>
            <div className="text-sm text-purple-600">Success Rate</div>
          </div>
        </div>

        {/* Faculty Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b">
            <Button
              variant={selectedFacultyTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedFacultyTab("all")}
              className="rounded-b-none"
            >
              All Programs ({statistics.total})
            </Button>
            {Object.keys(programsByFaculty).map((faculty) => (
              <Button
                key={faculty}
                variant={selectedFacultyTab === faculty ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFacultyTab(faculty)}
                className="rounded-b-none"
              >
                {faculty} ({facultyCounts[faculty]?.total || 0})
                {facultyCounts[faculty]?.eligible > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-green-100 text-green-800 text-xs"
                  >
                    {facultyCounts[faculty].eligible}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        {displayedPrograms.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No programs found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFacultyTab === "all"
                ? "Try adjusting your filters or add more subjects."
                : `No programs found in ${selectedFacultyTab} faculty.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPrograms.map((program, index) => (
              <ProgramCard key={`${program.id}-${index}`} program={program} />
            ))}
          </div>
        )}

        {/* Show More Button for Large Lists */}
        {displayedPrograms.length > 9 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {Math.min(9, displayedPrograms.length)} of{" "}
              {displayedPrograms.length} programs
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibleProgramsSection;
