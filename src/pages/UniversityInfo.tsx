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
import { Button } from "@/components/ui/button";
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
  Calendar,
  Clock,
  CreditCard,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES as SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import {
  UNIVERSITY_APPLICATIONS_2025,
  getApplicationInfo,
} from "@/constants/universities/university-applications-2025";
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
  const [showAllUniversities, setShowAllUniversities] = useState(false);

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

  // University Application Card Component
  const UniversityApplicationCard = ({
    applicationInfo,
  }: {
    applicationInfo: any;
  }) => {
    const [showMore, setShowMore] = useState(false);
    const universityData = SOUTH_AFRICAN_UNIVERSITIES.find(
      (uni) => uni.id === applicationInfo.id,
    );

    return (
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* University Logo */}
              <div className="w-14 h-14 bg-white border-2 border-book-200 rounded-xl flex items-center justify-center overflow-hidden">
                {universityData?.logo ? (
                  <img
                    src={universityData.logo}
                    alt={`${applicationInfo.name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display =
                        "block";
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-book-500 to-book-600 rounded-lg flex items-center justify-center text-white font-bold text-sm ${universityData?.logo ? "hidden" : "block"}`}
                >
                  {applicationInfo.abbreviation}
                </div>
              </div>
              <div>
                <CardTitle className="text-lg group-hover:text-book-600 transition-colors">
                  {applicationInfo.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Building className="w-4 h-4" />
                  {applicationInfo.type}
                </CardDescription>
              </div>
            </div>
            {applicationInfo.isFree && (
              <Badge className="bg-book-100 text-book-800 border-book-200 font-semibold">
                No Fee
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Opening Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-book-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Opens</p>
              <p className="text-sm text-gray-600">
                {applicationInfo.openingDate}
              </p>
            </div>
          </div>

          {/* Closing Date */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Closes</p>
              <p className="text-sm text-gray-600">
                {applicationInfo.closingDate}
              </p>
              {applicationInfo.closingDateNotes && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  {applicationInfo.closingDateNotes}
                </p>
              )}
            </div>
          </div>

          {/* Application Fee */}
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-book-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">
                Application Fee
              </p>
              <p className="text-sm font-medium text-book-700">
                {applicationInfo.applicationFee}
              </p>
              {applicationInfo.feeNotes && (
                <p className="text-xs text-gray-500 mt-1">
                  {applicationInfo.feeNotes}
                </p>
              )}
            </div>
          </div>

          {/* Special Notes - Only show when expanded */}
          {showMore && applicationInfo.specialNotes && (
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-book-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  Special Notes
                </p>
                <p className="text-sm text-gray-600">
                  {applicationInfo.specialNotes}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {applicationInfo.specialNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="text-book-600 hover:bg-book-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMore(!showMore);
                }}
              >
                {showMore ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    View Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    View More
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-book-50 hover:border-book-300 text-book-600 border-book-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/university-profile?id=${applicationInfo.id}`);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              University Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Universities Grid with Application Information
  const UniversitiesApplicationGrid = () => {
    const displayedUniversities = showAllUniversities
      ? UNIVERSITY_APPLICATIONS_2025
      : UNIVERSITY_APPLICATIONS_2025.slice(0, 6);

    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              🇿🇦 South African Public Universities – 2025 Application Info
            </h2>
            <p className="text-gray-600">
              Complete application information for all{" "}
              {UNIVERSITY_APPLICATIONS_2025.length} public universities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedUniversities.map((applicationInfo) => (
              <UniversityApplicationCard
                key={applicationInfo.id}
                applicationInfo={applicationInfo}
              />
            ))}
          </div>

          {/* View More / View Less Button */}
          {UNIVERSITY_APPLICATIONS_2025.length > 6 && (
            <div className="text-center">
              <Button
                onClick={() => setShowAllUniversities(!showAllUniversities)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                {showAllUniversities ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    View Less Universities
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-2" />
                    View More Universities (
                    {UNIVERSITY_APPLICATIONS_2025.length - 6} more)
                  </>
                )}
              </Button>

              {!showAllUniversities && (
                <p className="text-sm text-gray-500 mt-3">
                  Showing 6 of {UNIVERSITY_APPLICATIONS_2025.length}{" "}
                  universities
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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

              {/* Universities with Application Information */}
              <UniversitiesApplicationGrid />

              {/* Quick Tools Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm hover:border-book-200"
                  onClick={() => handleTabChange("aps-calculator")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-book-600" />
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
                      className="bg-book-100 text-book-700 border-book-200"
                    >
                      Most Popular
                    </Badge>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm hover:border-book-200"
                  onClick={() => handleTabChange("bursaries")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-book-600" />
                      Find Bursaries
                    </CardTitle>
                    <CardDescription>
                      Discover funding opportunities for your university studies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant="outline"
                      className="border-book-200 text-book-700 bg-book-50"
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
