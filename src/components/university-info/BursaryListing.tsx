import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  BURSARIES,
  BURSARY_FIELDS_OF_STUDY,
} from "@/constants/enhancedBursaries";
import { PROVINCES } from "@/constants/bursaries";
import { BursaryFilters } from "@/types/university";

const BursaryListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BursaryFilters>({});
  const [expandedBursary, setExpandedBursary] = useState<string | null>(null);

  const filteredBursaries = useMemo(() => {
    return BURSARIES.filter((bursary) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        bursary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bursary.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bursary.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Field of study filter
      const matchesField =
        !filters.fieldOfStudy ||
        bursary.fieldsOfStudy.includes("All fields") ||
        bursary.fieldsOfStudy.includes(filters.fieldOfStudy);

      // Province filter
      const matchesProvince =
        !filters.province ||
        bursary.provinces.includes("All provinces") ||
        bursary.provinces.includes(filters.province);

      // Financial need filter
      const matchesFinancialNeed =
        filters.financialNeed === undefined ||
        bursary.requirements.financialNeed === filters.financialNeed;

      return (
        matchesSearch && matchesField && matchesProvince && matchesFinancialNeed
      );
    });
  }, [searchTerm, filters]);

  const updateFilter = (
    key: keyof BursaryFilters,
    value: string | boolean | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  const getApplicationStatus = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: "closed", message: "Application closed", color: "red" };
    } else if (daysDiff <= 30) {
      return {
        status: "closing",
        message: `${daysDiff} days left`,
        color: "orange",
      };
    } else {
      return { status: "open", message: "Application open", color: "green" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-book-800">
          Bursary Opportunities
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find financial assistance for your studies with comprehensive bursary
          listings from government, corporate sponsors, and educational
          institutions.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Your Perfect Bursary</CardTitle>
          <CardDescription>
            Use the filters below to find bursaries that match your needs and
            eligibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bursaries by name, provider, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.fieldOfStudy || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "fieldOfStudy",
                  value === "all" ? undefined : value,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Field of study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields</SelectItem>
                {BURSARY_FIELDS_OF_STUDY.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.province || "all"}
              onValueChange={(value) =>
                updateFilter("province", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="financial-need"
                checked={filters.financialNeed === true}
                onCheckedChange={(checked) =>
                  updateFilter("financialNeed", checked ? true : undefined)
                }
              />
              <label htmlFor="financial-need" className="text-sm font-medium">
                Financial need based
              </label>
            </div>

            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredBursaries.length} of {BURSARIES.length} bursaries
          </div>
        </CardContent>
      </Card>

      {/* Bursary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBursaries.map((bursary) => {
          const applicationStatus = getApplicationStatus(
            bursary.applicationDeadline,
          );
          const isExpanded = expandedBursary === bursary.id;

          return (
            <Card
              key={bursary.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-book-800">
                      {bursary.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium mt-1">
                      {bursary.provider}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      applicationStatus.status === "open"
                        ? "default"
                        : applicationStatus.status === "closing"
                          ? "destructive"
                          : "secondary"
                    }
                    className="ml-2"
                  >
                    {applicationStatus.message}
                  </Badge>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2 text-lg font-semibold text-green-600 mt-2">
                  <DollarSign className="h-5 w-5" />
                  {bursary.amount}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{bursary.description}</p>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">
                      {bursary.applicationDeadline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Provinces:</span>
                    <span className="font-medium">
                      {bursary.provinces.includes("All provinces")
                        ? "All"
                        : bursary.provinces.slice(0, 2).join(", ")}
                      {bursary.provinces.length > 2 &&
                        !bursary.provinces.includes("All provinces") &&
                        "..."}
                    </span>
                  </div>
                </div>

                {/* Fields of Study */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Fields of Study:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {bursary.fieldsOfStudy.slice(0, 3).map((field, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {field}
                      </Badge>
                    ))}
                    {bursary.fieldsOfStudy.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bursary.fieldsOfStudy.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExpandedBursary(isExpanded ? null : bursary.id)
                  }
                  className="w-full"
                >
                  {isExpanded ? "Show Less" : "View Details & Requirements"}
                </Button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Eligibility Criteria */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Eligibility Criteria:
                      </h4>
                      <ul className="space-y-1">
                        {bursary.eligibilityCriteria.map((criteria, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-green-600 mt-1">•</span>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Application Process */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Application Process:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {bursary.applicationProcess}
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Contact Information:
                      </h4>
                      <p className="text-sm text-blue-700">
                        {bursary.contactInfo}
                      </p>
                      {bursary.website && (
                        <a
                          href={bursary.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBursaries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bursaries found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find more bursaries.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Important Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Application deadlines and requirements may
          change. Always verify information directly with the bursary provider
          before applying. Start your applications early to avoid missing
          deadlines.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BursaryListing;
