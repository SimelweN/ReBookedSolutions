import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  University,
  GraduationCap,
  BookOpen,
  MapPin,
  Building,
  Users,
  Award,
  Calculator,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES as SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import UniversityHero from "@/components/university-info/UniversityHero";
import PopularUniversities from "@/components/university-info/PopularUniversities";
import SEO from "@/components/SEO";
import CampusNavbar from "@/components/CampusNavbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { logProgramVerification } from "@/utils/program-verification";
import { logCriticalIssuesVerification } from "@/utils/critical-issues-verification";

// Direct import for APS calculator to fix loading issues
import APSCalculatorSection from "@/components/university-info/APSCalculatorSection";

// Keep lazy loading for other components
const LazyAPSCalculatorSection = lazy(
  () => import("@/components/university-info/APSCalculatorSection"),
);
const BursaryExplorerSection = lazy(
  () => import("@/components/university-info/BursaryExplorerSection"),
);
const CampusBooksSection = lazy(
  () => import("@/components/university-info/CampusBooksSection"),
);

const UniversityInfo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTool = searchParams.get("tool") || "overview";
  const selectedUniversityId = searchParams.get("university");

  // Find selected university if one is specified
  const selectedUniversity = useMemo(() => {
    if (!selectedUniversityId) return null;

    try {
      return (
        SOUTH_AFRICAN_UNIVERSITIES.find(
          (uni) => uni.id === selectedUniversityId,
        ) || null
      );
    } catch (error) {
      console.error("Error finding university:", error);
      return null;
    }
  }, [selectedUniversityId]);

  // Handle automatic redirect to APS calculator if coming from specific links
  useEffect(() => {
    if (window.location.hash === "#aps-calculator") {
      setSearchParams({ tool: "aps-calculator" });
    }
  }, [setSearchParams]);

  // Run program verification in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      logProgramVerification();
      logCriticalIssuesVerification();
    }
  }, []);

  // Redirect to new university profile route if university parameter is present
  useEffect(() => {
    if (selectedUniversityId) {
      navigate(`/university-profile?id=${selectedUniversityId}`, {
        replace: true,
      });
    }
  }, [selectedUniversityId, navigate]);

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams();
    newParams.set("tool", value);
    setSearchParams(newParams);
  };

  const handleBackToUniversities = () => {
    const newParams = new URLSearchParams();
    newParams.set("tool", "overview");
    setSearchParams(newParams);
  };

  // Memoized statistics calculation for better performance
  const stats = useMemo(() => {
    try {
      // Ensure SOUTH_AFRICAN_UNIVERSITIES is defined and is an array
      if (
        !SOUTH_AFRICAN_UNIVERSITIES ||
        !Array.isArray(SOUTH_AFRICAN_UNIVERSITIES)
      ) {
        console.warn("SOUTH_AFRICAN_UNIVERSITIES is not properly defined");
        return {
          universities: 0,
          students: "0",
          programs: "0",
          resources: "Loading...",
        };
      }

      const totalPrograms = SOUTH_AFRICAN_UNIVERSITIES.reduce((total, uni) => {
        // Safely handle undefined or null universities
        if (!uni) {
          return total;
        }

        // Safely handle undefined or null faculties
        if (!uni.faculties || !Array.isArray(uni.faculties)) {
          return total;
        }

        return (
          total +
          uni.faculties.reduce((facTotal, fac) => {
            // Safely handle undefined or null degrees
            if (!fac || !fac.degrees || !Array.isArray(fac.degrees)) {
              return facTotal;
            }
            return facTotal + fac.degrees.length;
          }, 0)
        );
      }, 0);

      return {
        universities: SOUTH_AFRICAN_UNIVERSITIES.length,
        students: "1M+",
        programs: `${totalPrograms}+`,
        resources: "Growing Daily",
      };
    } catch (error) {
      console.error("Error calculating university statistics:", error);
      return {
        universities: 0,
        students: "Error",
        programs: "Error",
        resources: "Error",
      };
    }
  }, []);

  // Loading component for lazy-loaded sections
  const LoadingSection = () => (
    <div className="flex justify-center items-center py-12">
      <LoadingSpinner />
    </div>
  );

  // University details are now handled by redirection to /university-profile

  return (
    <>
      <SEO
        title="ReBooked Campus - Your Complete University Guide"
        description="Explore South African universities, calculate your APS, find bursaries, and discover textbooks. Your one-stop platform for higher education in South Africa."
        keywords="South African universities, APS calculator, university bursaries, student textbooks, higher education, NSFAS"
        url="https://www.rebookedsolutions.co.za/university-info"
      />

      <CampusNavbar />

      <div className="min-h-screen bg-gray-50">
        {/* Main Content with Tabs */}
        <div className="container mx-auto px-4 py-6">
          <Tabs
            value={currentTool}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8 h-auto bg-gray-200 p-1">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <University className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="aps-calculator"
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-center data-[state=active]:bg-green-50 data-[state=active]:shadow-sm data-[state=active]:text-green-800"
              >
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">APS</span>
              </TabsTrigger>
              <TabsTrigger
                value="bursaries"
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Bursaries</span>
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Books</span>
              </TabsTrigger>
              <TabsTrigger
                value="accommodation"
                className="flex flex-col items-center gap-1 py-2.5 px-2 text-center data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Accommodation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Hero Section */}
              <UniversityHero onNavigateToTool={handleTabChange} />

              {/* Popular Universities */}
              <PopularUniversities />

              {/* Quick Tools Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
                  onClick={() => handleTabChange("aps-calculator")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator
                        className="h-5 w-5"
                        style={{ color: "rgb(68, 171, 131)" }}
                      />
                      APS Calculator
                    </CardTitle>
                    <CardDescription>
                      Calculate your Admission Point Score and find qualifying
                      programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Most Popular
                    </Badge>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
                  onClick={() => handleTabChange("bursaries")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign
                        className="h-5 w-5"
                        style={{ color: "rgb(68, 171, 131)" }}
                      />
                      Find Bursaries
                    </CardTitle>
                    <CardDescription>
                      Discover funding opportunities for your university studies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50"
                    >
                      40+ Available
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* About Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-600" />
                    About ReBooked Campus
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    ReBooked Campus is your comprehensive guide to South African
                    higher education. We provide tools and resources to help you
                    make informed decisions about your university journey, from
                    calculating your APS score to finding the right bursaries
                    and degree programs.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">For Students</h4>
                        <p className="text-sm text-gray-600">
                          Tools and guidance for university planning
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Trusted Information</h4>
                        <p className="text-sm text-gray-600">
                          Accurate, up-to-date university data
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aps-calculator" className="space-y-6">
              <APSCalculatorSection />
            </TabsContent>

            <TabsContent value="bursaries" className="space-y-6">
              <Suspense fallback={<LoadingSection />}>
                <BursaryExplorerSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="books" className="space-y-6">
              <Suspense fallback={<LoadingSection />}>
                <CampusBooksSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="accommodation" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Student Accommodation
                </h2>
                <p className="text-gray-600 mb-8">
                  Find housing options near your university
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
                  <Building className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-yellow-700">
                    We're working on bringing you comprehensive accommodation
                    listings and booking services.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default UniversityInfo;
