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
} from "lucide-react";
import Layout from "@/components/Layout";

/**
 * University Profile Component - Complete modern redesign
 */
const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("programs");

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
        <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
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
                    <div className="w-20 h-20 bg-white border-4 border-gray-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-gray-700">
                        {university.abbreviation ||
                          university.name.substring(0, 3).toUpperCase()}
                      </span>
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
                        className="mb-3 bg-blue-50 text-blue-700 border-blue-200"
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
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
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

        {/* Content tabs */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0 w-full justify-start">
                <TabsTrigger
                  value="programs"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-book-600 rounded-none py-4 px-6 text-gray-600 data-[state=active]:text-book-600"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Programs
                </TabsTrigger>
                <TabsTrigger
                  value="admissions"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-book-600 rounded-none py-4 px-6 text-gray-600 data-[state=active]:text-book-600"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Admissions
                </TabsTrigger>
                <TabsTrigger
                  value="student-life"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-book-600 rounded-none py-4 px-6 text-gray-600 data-[state=active]:text-book-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Student Life
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-book-600 rounded-none py-4 px-6 text-gray-600 data-[state=active]:text-book-600"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
              </TabsList>

              <div className="py-8">
                <TabsContent value="programs" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Academic Programs
                      </h2>
                      <Button className="bg-book-600 hover:bg-book-700 text-white">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Your APS
                      </Button>
                    </div>

                    {university.faculties && university.faculties.length > 0 ? (
                      <div className="grid gap-6">
                        {university.faculties.map((faculty, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-6"
                          >
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                              {faculty.name}
                            </h3>
                            {faculty.description && (
                              <p className="text-gray-600 mb-4">
                                {faculty.description}
                              </p>
                            )}

                            {faculty.degrees && faculty.degrees.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">
                                  Available Programs:
                                </h4>
                                <div className="grid gap-2">
                                  {faculty.degrees
                                    .slice(0, 3)
                                    .map((degree, degreeIndex) => (
                                      <div
                                        key={degreeIndex}
                                        className="bg-white rounded p-3 border border-gray-200"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="font-medium text-gray-900">
                                              {degree.name}
                                            </h5>
                                            {degree.description && (
                                              <p className="text-sm text-gray-600 mt-1">
                                                {degree.description}
                                              </p>
                                            )}
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="ml-4"
                                          >
                                            APS: {degree.apsRequirement}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  {faculty.degrees.length > 3 && (
                                    <div className="text-center py-2">
                                      <Button variant="outline" size="sm">
                                        View {faculty.degrees.length - 3} more
                                        programs
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          No Programs Available
                        </h3>
                        <p className="text-gray-500">
                          Program information for this university is not yet
                          available.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="admissions" className="mt-0">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Admissions Information
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-600">
                        Admissions information is coming soon. Please visit the
                        university website for current application details.
                      </p>
                      {university.website && (
                        <Button
                          className="mt-4 bg-book-600 hover:bg-book-700 text-white"
                          asChild
                        >
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit University Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="student-life" className="mt-0">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Student Life
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-600">
                        Student life information is coming soon.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Resources
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-600">
                        University resources information is coming soon.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UniversityProfile;
