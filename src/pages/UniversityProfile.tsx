import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  BookOpen,
  Calculator,
  BarChart3,
  Users,
  Calendar,
  Building,
  GraduationCap,
  Globe,
} from "lucide-react";
import Layout from "@/components/Layout";

/**
 * University Profile Component - Clean and professional design
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
      <div className="bg-gray-50 min-h-screen">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-6 py-8 relative z-10">
            {/* Back button */}
            <Link
              to="/university-info"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Universities
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left side - University info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-start gap-6">
                  {/* University logo */}
                  <div className="bg-white rounded-xl p-4 shadow-lg shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {university.abbreviation ||
                          university.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-blue-100 text-blue-800 border-0 mb-3 font-medium">
                        {university.type}
                      </Badge>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                        {university.fullName || university.name}
                      </h1>
                      <div className="flex items-center text-gray-300 mb-4">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-base">
                          {university.location}, {university.province}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed max-w-2xl text-base">
                      {university.overview ||
                        "A leading South African university committed to academic excellence, innovation, and producing graduates who make a difference in the world."}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {university.website && (
                    <Button
                      className="bg-white text-slate-800 hover:bg-gray-100 shadow-md font-medium"
                      asChild
                    >
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}

                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-medium">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Find Textbooks
                  </Button>

                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-medium">
                    <Calculator className="h-4 w-4 mr-2" />
                    APS Calculator
                  </Button>
                </div>
              </div>

              {/* Right side - University stats */}
              <div className="lg:col-span-1">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-6 flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      University Stats
                    </h3>

                    <div className="space-y-5">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-200 font-medium">
                          Students
                        </span>
                        <span className="text-white font-bold text-xl">
                          {studentCount}
                        </span>
                      </div>

                      {university.establishedYear && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-200 font-medium">
                            Established
                          </span>
                          <span className="text-white font-bold text-xl">
                            {university.establishedYear}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-200 font-medium">
                          Faculties
                        </span>
                        <span className="text-white font-bold text-xl">
                          {university.faculties?.length || 0}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-200 font-medium">
                          Programs
                        </span>
                        <span className="text-white font-bold text-xl">
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
