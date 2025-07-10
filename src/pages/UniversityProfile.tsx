import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  BookOpen,
  Calculator,
  BarChart3,
  Users,
  Calendar,
  Building2,
  GraduationCap,
  Globe,
  TrendingUp,
  Award,
  Heart,
  Info,
  Eye,
} from "lucide-react";
import Layout from "@/components/Layout";
import ProgramDetailModal from "@/components/university-info/ProgramDetailModal";
import { Degree } from "@/types/university";

/**
 * University Profile Component - Complete modern redesign
 */
const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("programs");
  const [selectedProgram, setSelectedProgram] = useState<Degree | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  const handleViewProgram = (program: Degree) => {
    setSelectedProgram(program);
    setIsProgramModalOpen(true);
  };

  const closeProgramModal = () => {
    setIsProgramModalOpen(false);
    setSelectedProgram(null);
  };

  const university = ALL_SOUTH_AFRICAN_UNIVERSITIES.find(
    (uni) =>
      uni.id === id || uni.name.toLowerCase().replace(/\s+/g, "-") === id,
  );

  if (!university) {
    return <Navigate to="/university-info" replace />;
  }

  // Calculate stats
  const totalPrograms =
    university.faculties?.reduce((total, faculty) => {
      return total + (faculty.degrees?.length || 0);
    }, 0) || 0;

  const studentCount = university.studentPopulation
    ? university.studentPopulation > 1000
      ? `${Math.round(university.studentPopulation / 1000)}k+`
      : university.studentPopulation.toString()
    : "N/A";

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Clean Header */}
        <div className="bg-gradient-to-b from-book-100 via-book-50 to-white border-b border-book-200">
          <div className="container mx-auto px-6 py-8">
            {/* Back Navigation */}
            <Link
              to="/university-info"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Universities</span>
            </Link>

            {/* University Header */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-3">
                <div className="flex items-start gap-6 mb-8">
                  {/* Logo */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-white border-4 border-book-200 rounded-2xl flex items-center justify-center shadow-lg">
                      {university.logo ? (
                        <img
                          src={university.logo}
                          alt={`${university.name} logo`}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-700">
                          {university.abbreviation ||
                            university.name.substring(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-book-500 rounded-full flex items-center justify-center">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-book-50 text-book-700 border-book-200"
                      >
                        {university.type}
                      </Badge>
                      <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        {university.fullName || university.name}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="text-lg">
                          {university.location}, {university.province}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-lg max-w-3xl">
                      {university.overview ||
                        "A prestigious South African institution dedicated to academic excellence, research innovation, and developing leaders who shape the future."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {university.website && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 hover:border-book-500 hover:text-book-600"
                      asChild
                    >
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        Official Website
                      </a>
                    </Button>
                  )}

                  <Button
                    size="lg"
                    className="bg-book-600 hover:bg-book-700 text-white"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Find Textbooks
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    APS Calculator
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-book-50 border-book-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center text-gray-800">
                      <BarChart3 className="h-5 w-5 mr-2 text-book-500" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Students
                      </span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {studentCount}
                        </span>
                      </div>
                    </div>

                    {university.establishedYear && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">
                          Founded
                        </span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-book-500" />
                          <span className="font-bold text-gray-900">
                            {university.establishedYear}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Faculties
                      </span>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {university.faculties?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Programs
                      </span>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {totalPrograms}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Modern Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <TabsList className="bg-transparent p-1 h-auto w-full grid grid-cols-4 rounded-xl">
                <TabsTrigger
                  value="programs"
                  className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  <GraduationCap className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Academic Programs</span>
                  <span className="sm:hidden">Programs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="admissions"
                  className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Admissions</span>
                  <span className="sm:hidden">Apply</span>
                </TabsTrigger>
                <TabsTrigger
                  value="student-life"
                  className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Campus Life</span>
                  <span className="sm:hidden">Life</span>
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  <Info className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Resources</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="programs" className="mt-0">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Academic Programs
                    </h2>
                    <p className="text-gray-600">
                      Explore {totalPrograms} programs across{" "}
                      {university.faculties?.length || 0} faculties
                    </p>
                  </div>
                  <Button className="bg-book-600 hover:bg-book-700 text-white shadow-lg">
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Your APS
                  </Button>
                </div>

                {university.faculties && university.faculties.length > 0 ? (
                  <div className="grid gap-8">
                    {university.faculties.map((faculty, index) => (
                      <Card key={index} className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                          <CardTitle className="text-xl flex items-center text-gray-900">
                            <Building2 className="h-6 w-6 mr-3 text-book-500" />
                            {faculty.name}
                          </CardTitle>
                          {faculty.description && (
                            <p className="text-gray-600 mt-2">
                              {faculty.description}
                            </p>
                          )}
                        </CardHeader>

                        {faculty.degrees && faculty.degrees.length > 0 && (
                          <CardContent className="pt-6">
                            <div className="grid gap-4">
                              {faculty.degrees
                                .slice(0, 3)
                                .map((degree, degreeIndex) => (
                                  <div
                                    key={degreeIndex}
                                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-book-200 transition-all duration-200"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 mb-2 group-hover:text-book-700 transition-colors">
                                          {degree.name}
                                        </h5>
                                        {degree.description && (
                                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                            {degree.description}
                                          </p>
                                        )}
                                        {degree.duration && (
                                          <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {degree.duration}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Badge className="bg-book-100 text-book-700 border-book-200">
                                          APS: {degree.apsRequirement}
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-book-200 text-book-600 hover:bg-book-50"
                                          onClick={() =>
                                            handleViewProgram(degree)
                                          }
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View More
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {faculty.degrees.length > 3 && (
                                <div className="text-center py-4">
                                  <Button
                                    variant="outline"
                                    className="border-book-200 text-book-600 hover:bg-book-50"
                                  >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View {faculty.degrees.length - 3} more
                                    programs
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="text-center py-16">
                      <GraduationCap className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">
                        No Programs Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Program information for this university is not yet
                        available. Please check back later or contact the
                        university directly.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="admissions" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Admissions Information
                  </h2>
                  <p className="text-gray-600">
                    Everything you need to know about applying to{" "}
                    {university.name}
                  </p>
                </div>

                {/* Application Dates */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Calendar className="h-6 w-6 mr-3 text-book-500" />
                      Application Dates & Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {university.applicationInfo ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">
                              Application Period
                            </h4>
                            <p className="text-green-700">
                              {university.applicationInfo.openingDate} -{" "}
                              {university.applicationInfo.closingDate}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              Academic Year
                            </h4>
                            <p className="text-blue-700">
                              {university.applicationInfo.academicYear}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-800 mb-2">
                              Application Fee
                            </h4>
                            <p className="text-orange-700">
                              {university.applicationInfo.applicationFee ||
                                "No application fee"}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-2">
                              Application Method
                            </h4>
                            <p className="text-purple-700">
                              {university.applicationInfo.applicationMethod}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">
                          Application dates will be published closer to the
                          application period.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Application Process */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Users className="h-6 w-6 mr-3 text-book-500" />
                      Application Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-book-500 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Check Admission Requirements
                          </h4>
                          <p className="text-gray-600">
                            Review the specific requirements for your chosen
                            program, including APS scores and subject
                            requirements.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-book-500 text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Prepare Required Documents
                          </h4>
                          <p className="text-gray-600">
                            Gather certified copies of ID, academic transcripts,
                            and any additional documents required for your
                            program.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-book-500 text-white rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Submit Online Application
                          </h4>
                          <p className="text-gray-600">
                            Complete the online application form and upload all
                            required documents before the deadline.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-book-500 text-white rounded-full flex items-center justify-center font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Track Application Status
                          </h4>
                          <p className="text-gray-600">
                            Monitor your application status through the student
                            portal and respond to any requests for additional
                            information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Aid */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Award className="h-6 w-6 mr-3 text-book-500" />
                      Financial Aid & Funding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">
                          Government Funding
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-800">
                              NSFAS
                            </h5>
                            <p className="text-sm text-green-700">
                              National Student Financial Aid Scheme for
                              qualifying students
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-800">
                              Provincial Bursaries
                            </h5>
                            <p className="text-sm text-blue-700">
                              Provincial government bursary programs available
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">
                          University Support
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <h5 className="font-medium text-purple-800">
                              Merit Scholarships
                            </h5>
                            <p className="text-sm text-purple-700">
                              Academic excellence scholarships for top
                              performers
                            </p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <h5 className="font-medium text-orange-800">
                              Need-Based Aid
                            </h5>
                            <p className="text-sm text-orange-700">
                              Financial assistance for students from
                              disadvantaged backgrounds
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Info className="h-6 w-6 mr-3 text-book-500" />
                      Admissions Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Get Help With Your Application
                        </h4>
                        <div className="space-y-2">
                          {university.admissionsContact && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Email:</span>
                              <span className="text-book-600">
                                {university.admissionsContact}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium w-20">Website:</span>
                            <a
                              href={university.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-book-600 hover:text-book-700 underline"
                            >
                              {university.website}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {university.website && (
                          <Button
                            className="bg-book-600 hover:bg-book-700 text-white"
                            asChild
                          >
                            <a
                              href={university.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-5 w-5 mr-2" />
                              Visit University Website
                            </a>
                          </Button>
                        )}
                        {university.studentPortal && (
                          <Button
                            variant="outline"
                            className="border-book-200 text-book-600 hover:bg-book-50"
                            asChild
                          >
                            <a
                              href={university.studentPortal}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Users className="h-5 w-5 mr-2" />
                              Student Portal
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="student-life" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Campus Life
                  </h2>
                  <p className="text-gray-600">
                    Discover what makes campus life special
                  </p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Heart className="h-16 w-16 mx-auto text-book-500 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Campus Life Information Coming Soon
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We're preparing detailed information about student life,
                      campus facilities, and extracurricular activities.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    University Resources
                  </h2>
                  <p className="text-gray-600">
                    Essential resources and facilities
                  </p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Info className="h-16 w-16 mx-auto text-book-500 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Resources Information Coming Soon
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We're compiling comprehensive information about university
                      resources, facilities, and support services.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Program Detail Modal */}
      <ProgramDetailModal
        program={selectedProgram}
        university={university}
        isOpen={isProgramModalOpen}
        onClose={closeProgramModal}
      />
    </Layout>
  );
};

export default UniversityProfile;
