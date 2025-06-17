import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { University, Faculty, Degree } from "@/types/university";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import CampusNavbar from "@/components/CampusNavbar";
import SEO from "@/components/SEO";

const UniversityProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const universityId = searchParams.get("id");
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(
    new Set(),
  );
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(
    new Set(),
  );

  // Find the university
  const university = useMemo(() => {
    if (!universityId) return null;
    return (
      ALL_SOUTH_AFRICAN_UNIVERSITIES.find((uni) => uni.id === universityId) ||
      null
    );
  }, [universityId]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!university)
      return {
        students: "0",
        established: "N/A",
        faculties: 0,
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
        : "29,000+",
      established: university.establishedYear?.toString() || "1829",
      faculties: university.faculties?.length || 6,
      province: university.province || "Western Cape",
    };
  }, [university]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/university-info");
  };

  // Handle faculty expansion
  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId);
      // Also collapse all programs in this faculty
      const newExpandedPrograms = new Set(expandedPrograms);
      university?.faculties
        ?.find((f) => f.id === facultyId)
        ?.degrees?.forEach((degree) => {
          newExpandedPrograms.delete(degree.id);
        });
      setExpandedPrograms(newExpandedPrograms);
    } else {
      newExpanded.add(facultyId);
    }
    setExpandedFaculties(newExpanded);
  };

  // Handle program expansion
  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              University Not Found
            </h1>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
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
        description={`Explore ${university.fullName || university.name} programs, faculties, and information. Complete guide to ${university.name}.`}
        keywords={`${university.name}, ${university.abbreviation}, university programs, faculties, South African universities`}
        url={`https://www.rebookedsolutions.co.za/university-profile?id=${university.id}`}
      />

      <CampusNavbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="flex flex-col mb-6">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="self-start bg-transparent border-none text-green-600 hover:bg-transparent hover:text-green-700 font-medium h-10 px-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Universities</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleVisitWebsite}
                  variant="outline"
                  className="flex items-center justify-center h-10 px-4 bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>Visit Website</span>
                </Button>
                <Button
                  onClick={handleViewBooks}
                  className="flex items-center justify-center h-10 px-4 bg-green-600 text-white hover:bg-green-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>View Books</span>
                </Button>
              </div>
            </div>

            {/* University Header */}
            <div className="flex items-start">
              {/* University Logo */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 w-20 h-20 flex items-center justify-center flex-shrink-0">
                {university.logo ? (
                  <img
                    src={university.logo}
                    alt={`${university.name} logo`}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <Building
                  className={`h-12 w-12 text-gray-400 ${university.logo ? "hidden" : ""}`}
                />
              </div>

              {/* University Info */}
              <div className="flex-1 ml-6 text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {university.fullName || university.name}
                </h1>
                <div className="flex items-start text-left">
                  <div className="flex items-center text-left">
                    <MapPin className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-gray-600">
                      <span>{university.location}</span>
                      <span>, </span>
                      <span>{university.province}</span>
                    </span>
                  </div>
                  <div className="flex items-center ml-4 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-700">
                    Public University
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <TabsList className="bg-transparent h-auto p-0 space-x-8">
                {[
                  { value: "overview", label: "Overview", icon: BookOpen },
                  { value: "programs", label: "Programs", icon: GraduationCap },
                  { value: "admissions", label: "Admissions", icon: Calendar },
                  { value: "contact", label: "Contact", icon: Mail },
                  { value: "campus", label: "Campus", icon: Building },
                  {
                    value: "accommodation",
                    label: "Accommodation",
                    icon: Home,
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none py-4 px-0 text-gray-600 data-[state=active]:text-green-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="overview">
              <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="col-span-2 space-y-6">
                  {/* About Section */}
                  <Card className="bg-white border border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        <span>About </span>
                        <span>{university.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        {university.overview ||
                          `${university.fullName || university.name} is a public research university located in ${university.location}, ${university.province}. It is consistently ranked among the top universities in the world.`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* University Statistics */}
                  <Card className="bg-white border border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        University Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          {
                            icon: Users,
                            value: stats.students,
                            label: "Students",
                            color: "text-green-600",
                          },
                          {
                            icon: Calendar,
                            value: stats.established,
                            label: "Established",
                            color: "text-green-600",
                          },
                          {
                            icon: BookOpen,
                            value: stats.faculties,
                            label: "Faculties",
                            color: "text-green-600",
                          },
                          {
                            icon: MapPin,
                            value: stats.province,
                            label: "Province",
                            color: "text-green-600",
                          },
                        ].map((stat, index) => (
                          <div
                            key={index}
                            className="text-center p-4 rounded-lg"
                          >
                            <stat.icon
                              className={`h-6 w-6 ${stat.color} mx-auto mb-2`}
                            />
                            <div className={`text-2xl font-bold ${stat.color}`}>
                              {stat.value}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="bg-white border border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={handleViewBooks}
                        className="w-full bg-green-600 text-white hover:bg-green-700 h-11"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Browse Books for </span>
                        <span>{university.abbreviation}</span>
                      </Button>
                      <Button
                        onClick={handleAPSRequirements}
                        variant="outline"
                        className="w-full bg-green-50 border-green-200 text-green-600 hover:bg-green-100 h-11 mt-3"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        <span>Check APS Requirements</span>
                      </Button>
                      <Button
                        onClick={handleBursaries}
                        variant="outline"
                        className="w-full bg-green-50 border-green-200 text-green-600 hover:bg-green-100 h-11 mt-3"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        <span>Find Bursaries</span>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-white border border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">
                          Website
                        </label>
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline break-all inline"
                        >
                          {university.website}
                        </a>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">
                          Location
                        </label>
                        <p className="text-gray-600 text-sm">
                          <span>{university.location}</span>
                          <span>, </span>
                          <span>{university.province}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Universities in Province */}
                  <Card className="bg-white border border-green-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        <span>Other Universities in </span>
                        <span>{university.province}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {otherUniversitiesInProvince.map((uni, index) => (
                          <Button
                            key={uni.id}
                            variant="outline"
                            className="w-full justify-between border border-gray-200 h-11 text-left"
                            onClick={() =>
                              navigate(`/university-profile?id=${uni.id}`)
                            }
                          >
                            <div className="text-gray-900 text-sm font-medium">
                              {uni.abbreviation}
                            </div>
                            <div className="text-gray-600 text-xs">
                              {uni.location}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="programs">
              <div className="space-y-6">
                <div className="text-center pb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Academic Programs
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Explore programs across {university.faculties?.length || 0}{" "}
                    faculties
                  </p>
                </div>

                {university.faculties && university.faculties.length > 0 ? (
                  <div className="space-y-6">
                    {university.faculties.map((faculty, index) => (
                      <Card
                        key={faculty.id || index}
                        className="bg-white border border-gray-200 shadow-sm"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleFaculty(faculty.id)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                                  style={{
                                    backgroundColor: "rgba(68, 171, 131, 0.1)",
                                  }}
                                >
                                  <Building
                                    className="h-8 w-8"
                                    style={{ color: "rgb(68, 171, 131)" }}
                                  />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900">
                                    {faculty.name}
                                  </h3>
                                  <p className="text-gray-600">
                                    {faculty.degrees?.length || 0} programs
                                    available
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge
                                  className="px-3 py-1 text-white"
                                  style={{
                                    backgroundColor: "rgb(68, 171, 131)",
                                  }}
                                >
                                  {faculty.degrees?.length || 0} Programs
                                </Badge>
                                {expandedFaculties.has(faculty.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </div>

                        {expandedFaculties.has(faculty.id) && (
                          <CardContent className="pt-0">
                            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                              {faculty.description}
                            </p>

                            {faculty.degrees && faculty.degrees.length > 0 ? (
                              <div className="space-y-4">
                                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                  Available Programs
                                </h4>
                                {faculty.degrees.map((degree, degreeIndex) => (
                                  <div
                                    key={degree.id || degreeIndex}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                  >
                                    <div
                                      className="p-4 cursor-pointer hover:bg-gray-50"
                                      onClick={() => toggleProgram(degree.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                            {degree.name}
                                          </h5>
                                          <div className="flex flex-wrap gap-3">
                                            <Badge
                                              variant="outline"
                                              className="bg-gray-50 border-gray-200 text-gray-700 px-3 py-1"
                                            >
                                              <Calendar className="h-3 w-3 mr-1" />
                                              {degree.duration}
                                            </Badge>
                                            <Badge
                                              className="px-3 py-1 text-white"
                                              style={{
                                                backgroundColor:
                                                  "rgb(68, 171, 131)",
                                              }}
                                            >
                                              <Award className="h-3 w-3 mr-1" />
                                              APS: {degree.apsRequirement}
                                            </Badge>
                                          </div>
                                        </div>
                                        {expandedPrograms.has(degree.id) ? (
                                          <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                      </div>
                                    </div>

                                    {expandedPrograms.has(degree.id) && (
                                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                                        <div className="pt-4 space-y-4">
                                          <div>
                                            <h6 className="font-semibold text-gray-900 mb-2">
                                              Description
                                            </h6>
                                            <p className="text-gray-600">
                                              {degree.description}
                                            </p>
                                          </div>

                                          {degree.careerProspects &&
                                            degree.careerProspects.length >
                                              0 && (
                                              <div>
                                                <h6 className="font-semibold text-gray-900 mb-2">
                                                  Career Prospects
                                                </h6>
                                                <div className="flex flex-wrap gap-2">
                                                  {degree.careerProspects.map(
                                                    (career, careerIndex) => (
                                                      <Badge
                                                        key={careerIndex}
                                                        variant="secondary"
                                                        className="bg-blue-50 text-blue-700 border-blue-200"
                                                      >
                                                        {career}
                                                      </Badge>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {degree.subjects &&
                                            degree.subjects.length > 0 && (
                                              <div>
                                                <h6 className="font-semibold text-gray-900 mb-2">
                                                  Subject Requirements
                                                </h6>
                                                <div className="space-y-2">
                                                  {degree.subjects.map(
                                                    (subject, subjectIndex) => (
                                                      <div
                                                        key={subjectIndex}
                                                        className="flex items-center justify-between py-2 px-3 bg-white rounded border"
                                                      >
                                                        <span className="text-gray-700">
                                                          {subject.name}
                                                        </span>
                                                        <Badge variant="outline">
                                                          Level {subject.level}{" "}
                                                          {subject.isRequired
                                                            ? "(Required)"
                                                            : "(Recommended)"}
                                                        </Badge>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-gray-500">
                                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">
                                  No specific programs listed for this faculty.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <BookOpen className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                      No Programs Available
                    </h3>
                    <p className="text-gray-500 text-lg">
                      Program information for this university is not yet
                      available.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="admissions">
              <div className="space-y-8">
                <div className="text-center pb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Admissions Information
                  </h2>
                  <p className="text-lg text-gray-600">
                    Everything you need to know about applying
                  </p>
                </div>

                {university.applicationInfo ? (
                  <div className="space-y-8">
                    {/* Application Status */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-semibold mb-6">
                          Application Status
                        </h3>
                        <div className="flex items-center gap-4">
                          <Badge
                            className={`text-lg px-6 py-3 font-semibold ${
                              university.applicationInfo.isOpen
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {university.applicationInfo.isOpen
                              ? "🟢 Open for Applications"
                              : "🔴 Applications Closed"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Application Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          label: "Academic Year",
                          value: university.applicationInfo.academicYear,
                        },
                        {
                          label: "Opening Date",
                          value: university.applicationInfo.openingDate,
                        },
                        {
                          label: "Closing Date",
                          value: university.applicationInfo.closingDate,
                        },
                        {
                          label: "Application Fee",
                          value: university.applicationInfo.applicationFee,
                        },
                      ]
                        .filter((item) => item.value)
                        .map((item, index) => (
                          <Card
                            key={index}
                            className="bg-white border border-gray-200 shadow-sm"
                          >
                            <CardContent className="p-6">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {item.label}
                              </h4>
                              <p className="text-gray-600 text-lg">
                                {item.value}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {university.applicationInfo.applicationMethod && (
                      <Card className="bg-blue-50 border border-blue-200 shadow-sm">
                        <CardContent className="p-8">
                          <h3 className="text-xl font-semibold text-blue-900 mb-4">
                            Application Method
                          </h3>
                          <p className="text-blue-800 text-lg leading-relaxed">
                            {university.applicationInfo.applicationMethod}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Calendar className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                      No Admissions Information
                    </h3>
                    <p className="text-gray-500 text-lg mb-8">
                      Please visit the university website for current
                      application details.
                    </p>
                    {university.website && (
                      <Button
                        onClick={handleVisitWebsite}
                        size="lg"
                        className="text-white shadow-lg"
                        style={{ backgroundColor: "rgb(68, 171, 131)" }}
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Visit University Website
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="space-y-8">
                <div className="text-center pb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-lg text-gray-600">
                    Get in touch with the university
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {university.website && (
                    <Card className="bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Official Website
                          </h3>
                        </div>
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-lg font-medium hover:underline break-all"
                        >
                          {university.website}
                        </a>
                      </CardContent>
                    </Card>
                  )}

                  {university.admissionsContact && (
                    <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Admissions Office
                          </h3>
                        </div>
                        <p className="text-gray-700 text-lg">
                          {university.admissionsContact}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm md:col-span-2">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Campus Location
                        </h3>
                      </div>
                      <p className="text-gray-700 text-xl">
                        {university.location}, {university.province}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campus">
              <div className="space-y-8">
                <div className="text-center pb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Campus Information
                  </h2>
                  <p className="text-lg text-gray-600">
                    Learn about campus life and facilities
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {university.establishedYear && (
                    <Card className="bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm">
                      <CardContent className="p-8">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Founded
                        </h4>
                        <p className="text-gray-700 text-2xl font-bold">
                          {university.establishedYear}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {university.studentPopulation && (
                    <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
                      <CardContent className="p-8">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Student Population
                        </h4>
                        <p className="text-gray-700 text-2xl font-bold">
                          {university.studentPopulation.toLocaleString()}{" "}
                          students
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm md:col-span-2">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Campus Locations
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                          <Building className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Main Campus
                            </p>
                            <p className="text-gray-600">
                              {university.location}, {university.province}
                            </p>
                          </div>
                        </div>

                        {university.campuses &&
                          university.campuses.length > 0 &&
                          university.campuses.map((campus, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                              <Building className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Additional Campus
                                </p>
                                <p className="text-gray-600">{campus}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accommodation">
              <div className="text-center py-20">
                <div className="max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Home className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Student Accommodation
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    We're working on bringing you comprehensive accommodation
                    information for {university.name}.
                  </p>
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        Coming Soon
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our accommodation section will include dormitory
                        information, off-campus housing options, pricing
                        details, and application processes. Stay tuned for
                        updates!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default UniversityProfile;
