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
import SEO from "@/components/SEO";
import CampusNavbar from "@/components/CampusNavbar";
import LoadingSpinner from "@/components/LoadingSpinner";

// Direct import for APS calculator to fix loading issues
import APSCalculatorSection from "@/components/university-info/APSCalculatorSection";

// Keep lazy loading for other components
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

  // Simple Hero Component to replace the potentially problematic UniversityHero
  const SimpleHero = () => (
    <div className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Your Perfect University
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
          Explore {stats.universities} South African universities, calculate
          your APS, find bursaries, and discover {stats.programs} programs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Building className="w-8 h-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{stats.universities}</div>
            <div className="text-sm text-blue-200">Universities</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-300" />
            <div className="text-2xl font-bold">{stats.programs}</div>
            <div className="text-sm text-blue-200">Programs</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">{stats.students}</div>
            <div className="text-sm text-blue-200">Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">40+</div>
            <div className="text-sm text-blue-200">Bursaries</div>
          </div>
        </div>
      </div>
    </div>
  );

  // All Universities Grid - showing ALL 26 universities
  const AllUniversitiesGrid = () => (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          All South African Universities ({SOUTH_AFRICAN_UNIVERSITIES.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOUTH_AFRICAN_UNIVERSITIES.map((university) => (
            <Card
              key={university.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`/university-profile?id=${university.id}`)
              }
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <University className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{university.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {university.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-2">
                  {university.type}
                </Badge>
                <p className="text-sm text-gray-600">
                  {university.overview || "Leading South African institution"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

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
        {/* Debug information */}
        {import.meta.env.DEV && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 m-4">
            <div className="text-sm">
              <strong>Debug Info:</strong> Universities loaded:{" "}
              {SOUTH_AFRICAN_UNIVERSITIES?.length || 0}, Current tool:{" "}
              {currentTool}, University ID: {selectedUniversityId || "none"}
            </div>
          </div>
        )}

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
              <SimpleHero />

              {/* All Universities */}
              <AllUniversitiesGrid />

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
