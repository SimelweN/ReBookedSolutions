import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  BookOpen,
  Users,
  Calendar,
  Search,
  Building,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp,
  Home,
  Globe,
  Mail,
  Phone,
  Star,
  Target,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Briefcase,
  BookMarked,
  CreditCard,
  Clock,
  Shield,
  Lightbulb,
  Zap,
  Heart,
  Trophy,
  Calculator,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { University, Faculty, Degree } from "@/types/university";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import { getUniversityFaculties } from "@/constants/universities/comprehensive-course-database";
import CampusNavbar from "@/components/CampusNavbar";
import SEO from "@/components/SEO";

const UniversityProfile: React.FC = () => {
  const { id: universityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(
    new Set(),
  );
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(
    new Set(),
  );

  // Find the university and populate with comprehensive faculties
  const university = useMemo(() => {
    if (!universityId) return null;
    const baseUniversity = ALL_SOUTH_AFRICAN_UNIVERSITIES.find(
      (uni) => uni.id === universityId,
    );
    if (!baseUniversity) return null;

    // Get comprehensive faculties from course database
    const comprehensiveFaculties = getUniversityFaculties(universityId);

    return {
      ...baseUniversity,
      faculties: comprehensiveFaculties,
    };
  }, [universityId]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!university)
      return {
        students: "0",
        established: "N/A",
        faculties: 0,
        programs: 0,
        province: "N/A",
      };

    const programCount =
      university.faculties?.reduce((total, faculty) => {
        return total + (faculty.degrees?.length || 0);
      }, 0) || 0;

    return {
      students: university.studentPopulation
        ? university.studentPopulation > 1000
          ? `${Math.round(university.studentPopulation / 1000)}k+`
          : university.studentPopulation.toString()
        : "29k+",
      established: university.establishedYear?.toString() || "1829",
      faculties: university.faculties?.length || 6,
      programs: programCount,
      province: university.province || "Western Cape",
    };
  }, [university]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/university-info");
  };

  // Handle faculty expansion
  const toggleFaculty = (facultyId: string | undefined) => {
    if (!facultyId) return;

    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId);
    } else {
      newExpanded.add(facultyId);
    }
    setExpandedFaculties(newExpanded);
  };

  // Handle website visit
  const handleVisitWebsite = () => {
    if (university?.website) {
      window.open(university.website, "_blank");
    }
  };

  // Handle view books
  const handleViewBooks = () => {
    navigate(`/books?university=${university?.id}`);
  };

  // Handle APS requirements
  const handleAPSRequirements = () => {
    navigate("/university-info?tool=aps-calculator");
  };

  // Handle bursaries
  const handleBursaries = () => {
    navigate("/university-info?tool=bursaries");
  };

  // Get other universities in the same province
  const otherUniversitiesInProvince = useMemo(() => {
    if (!university) return [];
    return ALL_SOUTH_AFRICAN_UNIVERSITIES.filter(
      (uni) => uni.province === university.province && uni.id !== university.id,
    ).slice(0, 3);
  }, [university]);

  if (!university) {
    return (
      <>
        <CampusNavbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              University Not Found
            </h1>
            <p className="text-slate-600 mb-6">
              The university you're looking for doesn't exist or has been moved.
            </p>
            <Button
              onClick={handleBack}
              className="bg-book-600 hover:bg-book-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Universities
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${university.name} - University Profile | ReBooked Campus`}
        description={`Comprehensive profile of ${university.fullName || university.name}. Programs, admissions info, and everything you need to know about this South African university.`}
        keywords={`${university.name}, ${university.abbreviation}, university programs, faculties, South African universities`}
        url={`https://www.rebookedsolutions.co.za/university/${university.id}`}
      />

      <CampusNavbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-book-600 via-book-700 to-emerald-600">
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30 pointer-events-none"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-20 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8 lg:py-16">
            {/* Back Button */}
            <div className="mb-6 lg:mb-8">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Universities
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
              {/* University Info */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-3 shadow-lg flex-shrink-0">
                    <img
                      src={university.logo}
                      alt={`${university.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/university-logos/default.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight">
                        {university.name}
                      </h1>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm self-start"
                      >
                        {university.type}
                      </Badge>
                    </div>
                    <p className="text-lg sm:text-xl text-white/90 font-medium mb-2">
                      {university.fullName}
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/80 flex-shrink-0" />
                      <span className="text-white/80 text-sm sm:text-base">
                        {university.location}, {university.province}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                  {university.overview}
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleVisitWebsite}
                    className="bg-white text-book-700 hover:bg-white/90 shadow-lg w-full sm:w-auto"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button
                    onClick={handleViewBooks}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Find Textbooks
                  </Button>
                  <Button
                    onClick={handleAPSRequirements}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    APS Calculator
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-4 mt-6 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      Quick Stats
                    </h3>
                    <Trophy className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Students</span>
                      <span className="text-white font-bold text-base sm:text-lg">
                        {stats.students}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Established</span>
                      <span className="text-white font-bold text-base sm:text-lg">
                        {stats.established}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Faculties</span>
                      <span className="text-white font-bold text-base sm:text-lg">
                        {stats.faculties}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Programs</span>
                      <span className="text-white font-bold text-base sm:text-lg">
                        {stats.programs}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 container mx-auto px-4 -mt-4 lg:-mt-8 pb-16">
          <Tabs defaultValue="programs" className="space-y-6 lg:space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-2 relative z-30">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-100 rounded-xl gap-1 lg:gap-0">
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm px-2 lg:px-4"
                >
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Programs</span>
                  <span className="sm:hidden">Degrees</span>
                </TabsTrigger>
                <TabsTrigger
                  value="admissions"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm px-2 lg:px-4"
                >
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Admissions</span>
                  <span className="sm:hidden">Apply</span>
                </TabsTrigger>
                <TabsTrigger
                  value="student-life"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm px-2 lg:px-4"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Student Life</span>
                  <span className="sm:hidden">Life</span>
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-xs sm:text-sm px-2 lg:px-4"
                >
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Resources</span>
                  <span className="sm:hidden">Tools</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Programs Tab */}
            <TabsContent value="programs">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 relative z-30">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Academic Programs
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-book-600 border-book-600"
                    >
                      {stats.programs} Programs Available
                    </Badge>
                  </div>

                  {university.faculties && university.faculties.length > 0 ? (
                    <div className="space-y-4">
                      {university.faculties.map((faculty) => (
                        <Card
                          key={faculty.id}
                          className="border-2 border-slate-100 hover:border-book-300 transition-all duration-200"
                        >
                          <CardHeader
                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleFaculty(faculty.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg text-slate-900">
                                  {faculty.name}
                                </CardTitle>
                                <p className="text-slate-600 mt-1">
                                  {faculty.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                  {faculty.degrees?.length || 0} programs
                                </Badge>
                                {expandedFaculties.has(faculty.id) ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {expandedFaculties.has(faculty.id) && (
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                                {faculty.degrees?.map((degree) => (
                                  <div
                                    key={degree.id}
                                    className="p-3 lg:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                                      <h4 className="font-semibold text-slate-900 leading-tight text-sm lg:text-base flex-1">
                                        {degree.name}
                                      </h4>
                                      <Badge className="bg-book-100 text-book-700 hover:bg-book-200 text-xs whitespace-nowrap self-start">
                                        APS {degree.apsRequirement}
                                      </Badge>
                                    </div>

                                    <p className="text-xs lg:text-sm text-slate-600 mb-3 line-clamp-2">
                                      {degree.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs text-slate-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span>{degree.duration}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                                        <span>
                                          {degree.careerProspects?.length || 0}{" "}
                                          careers
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        Program information coming soon
                      </h3>
                      <p className="text-slate-500">
                        We're working on adding detailed program information for
                        this university.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Admissions Tab */}
            <TabsContent value="admissions">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Info */}
                <Card className="bg-white shadow-xl border-0 rounded-2xl relative z-30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="w-5 h-5 text-book-600" />
                      Application Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {university.applicationInfo ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-800">
                            Application Status
                          </span>
                          <Badge
                            className={
                              university.applicationInfo.isOpen
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {university.applicationInfo.isOpen
                              ? "Open"
                              : "Closed"}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Opening Date:
                            </span>
                            <span className="font-medium">
                              {university.applicationInfo.openingDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Closing Date:
                            </span>
                            <span className="font-medium">
                              {university.applicationInfo.closingDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Academic Year:
                            </span>
                            <span className="font-medium">
                              {university.applicationInfo.academicYear}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Application Fee:
                            </span>
                            <span className="font-medium">
                              {university.applicationInfo.applicationFee}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-sm text-slate-600 mb-3">
                            <strong>Application Method:</strong>{" "}
                            {university.applicationInfo.applicationMethod}
                          </p>
                          <Button
                            onClick={handleVisitWebsite}
                            className="w-full bg-book-600 hover:bg-book-700"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">
                          Application information not available. Please visit
                          the university website for details.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-book-50 to-emerald-50 shadow-xl border-0 rounded-2xl relative z-30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Zap className="w-5 h-5 text-book-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleAPSRequirements}
                      className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 shadow-md"
                    >
                      <Target className="w-4 h-4 mr-3" />
                      Calculate APS Requirements
                    </Button>

                    <Button
                      onClick={handleBursaries}
                      className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 shadow-md"
                    >
                      <Award className="w-4 h-4 mr-3" />
                      Find Bursaries & Funding
                    </Button>

                    <Button
                      onClick={handleViewBooks}
                      className="w-full justify-start bg-white hover:bg-slate-50 text-slate-900 shadow-md"
                    >
                      <BookMarked className="w-4 h-4 mr-3" />
                      Browse Textbooks
                    </Button>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-slate-900 mb-3">
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {university.admissionsContact && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            {university.admissionsContact}
                          </div>
                        )}
                        {university.website && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Globe className="w-4 h-4" />
                            {university.website.replace("https://", "")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Student Life Tab */}
            <TabsContent value="student-life">
              <Card className="bg-white shadow-xl border-0 rounded-2xl relative z-30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-5 h-5 text-book-600" />
                    Student Life & Campus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Student Community
                      </h3>
                      <p className="text-sm text-slate-600">
                        Join a vibrant community of {stats.students} students
                        from diverse backgrounds.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Academic Excellence
                      </h3>
                      <p className="text-sm text-slate-600">
                        Access to {stats.faculties} faculties offering
                        world-class education.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <Building className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Campus Life
                      </h3>
                      <p className="text-sm text-slate-600">
                        Modern facilities and resources in {university.location}
                        , {university.province}.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                    <h3 className="font-semibold text-slate-900 mb-3">
                      About the Campus
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {university.overview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-xl border-0 rounded-2xl relative z-30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Lightbulb className="w-5 h-5 text-book-600" />
                      Student Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleViewBooks}
                      className="w-full justify-start bg-book-50 hover:bg-book-100 text-book-700 border border-book-200"
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      Find Textbooks & Study Materials
                    </Button>

                    <Button
                      onClick={handleBursaries}
                      className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                    >
                      <Award className="w-4 h-4 mr-3" />
                      Scholarships & Bursaries
                    </Button>

                    <Button
                      onClick={handleAPSRequirements}
                      className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      APS Calculator & Requirements
                    </Button>

                    {university.studentPortal && (
                      <Button
                        onClick={() =>
                          window.open(university.studentPortal, "_blank")
                        }
                        className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                      >
                        <ExternalLink className="w-4 h-4 mr-3" />
                        Student Portal
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Other Universities in Province */}
                {otherUniversitiesInProvince.length > 0 && (
                  <Card className="bg-white shadow-xl border-0 rounded-2xl relative z-30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="w-5 h-5 text-book-600" />
                        Other Universities in {university.province}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {otherUniversitiesInProvince.map((uni) => (
                          <div
                            key={uni.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            onClick={() => navigate(`/university/${uni.id}`)}
                          >
                            <div className="w-10 h-10 bg-white rounded-lg p-2">
                              <img
                                src={uni.logo}
                                alt={`${uni.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/university-logos/default.svg";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">
                                {uni.name}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {uni.location}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default UniversityProfile;
