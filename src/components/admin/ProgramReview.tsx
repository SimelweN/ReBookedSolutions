import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  University,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface PendingProgram {
  id: string;
  programName: string;
  universityName: string;
  facultyName: string;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  apsRequirement: number;
  duration: string;
  description: string;
  subjects: Array<{
    name: string;
    level: number;
    isRequired: boolean;
  }>;
  careerProspects: string[];
  reviewNotes?: string;
}

const ProgramReview = () => {
  const [programs, setPrograms] = useState<PendingProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<PendingProgram | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockPrograms: PendingProgram[] = [
      {
        id: "1",
        programName: "Bachelor of Data Science",
        universityName: "University of Cape Town",
        facultyName: "Faculty of Science",
        submittedBy: "user123@student.ac.za",
        submittedAt: "2024-01-15T10:30:00Z",
        status: "pending",
        apsRequirement: 35,
        duration: "3 years",
        description:
          "A comprehensive program covering data analytics, machine learning, and statistical methods.",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Data Scientist",
          "Business Analyst",
          "Machine Learning Engineer",
        ],
      },
      {
        id: "2",
        programName: "Bachelor of Renewable Energy Engineering",
        universityName: "Stellenbosch University",
        facultyName: "Faculty of Engineering",
        submittedBy: "contributor@example.com",
        submittedAt: "2024-01-14T14:20:00Z",
        status: "pending",
        apsRequirement: 38,
        duration: "4 years",
        description:
          "Engineering program focused on sustainable energy solutions and green technology.",
        subjects: [
          { name: "Mathematics", level: 7, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          {
            name: "Engineering Graphics and Design",
            level: 5,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Renewable Energy Engineer",
          "Sustainability Consultant",
          "Energy Systems Analyst",
        ],
      },
      {
        id: "3",
        programName: "Bachelor of Digital Marketing",
        universityName: "University of Witwatersrand",
        facultyName: "Faculty of Commerce and Management",
        submittedBy: "student@wits.ac.za",
        submittedAt: "2024-01-13T09:15:00Z",
        status: "approved",
        apsRequirement: 30,
        duration: "3 years",
        description:
          "Modern marketing program with focus on digital strategies and analytics.",
        subjects: [
          { name: "English Home Language", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Business Studies", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Digital Marketing Manager",
          "SEO Specialist",
          "Social Media Manager",
        ],
        reviewNotes:
          "Approved - Good coverage of modern digital marketing topics.",
      },
    ];

    setTimeout(() => {
      setPrograms(mockPrograms);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || program.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (programId: string) => {
    try {
      // In real implementation, make API call here
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId
            ? { ...program, status: "approved" as const, reviewNotes }
            : program,
        ),
      );
      toast.success("Program approved successfully!");
      setSelectedProgram(null);
      setReviewNotes("");
    } catch (error) {
      toast.error("Failed to approve program");
    }
  };

  const handleReject = async (programId: string) => {
    try {
      if (!reviewNotes.trim()) {
        toast.error("Please provide rejection reason in review notes");
        return;
      }

      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId
            ? { ...program, status: "rejected" as const, reviewNotes }
            : program,
        ),
      );
      toast.success("Program rejected with notes");
      setSelectedProgram(null);
      setReviewNotes("");
    } catch (error) {
      toast.error("Failed to reject program");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading pending programs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <University className="h-5 w-5 text-blue-600" />
            <span>Program Review Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search programs, universities, or submitters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Programs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <University className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No programs found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No program submissions to review at this time"}
                </p>
              </div>
            ) : (
              filteredPrograms.map((program) => (
                <Card key={program.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">
                            {program.programName}
                          </h3>
                          {getStatusBadge(program.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>University:</strong>{" "}
                            {program.universityName}
                          </p>
                          <p>
                            <strong>Faculty:</strong> {program.facultyName}
                          </p>
                          <p>
                            <strong>Duration:</strong> {program.duration} |{" "}
                            <strong>APS:</strong> {program.apsRequirement}
                          </p>
                          <p>
                            <strong>Submitted by:</strong> {program.submittedBy}
                          </p>
                          <p>
                            <strong>Submitted:</strong>{" "}
                            {new Date(program.submittedAt).toLocaleDateString()}
                          </p>
                        </div>

                        {program.reviewNotes && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  Review Notes:
                                </p>
                                <p className="text-sm text-yellow-700">
                                  {program.reviewNotes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProgram(program)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <University className="h-5 w-5" />
                                <span>Review Program Submission</span>
                              </DialogTitle>
                              <DialogDescription>
                                Review all details and approve or reject this
                                program submission
                              </DialogDescription>
                            </DialogHeader>

                            {selectedProgram && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Program Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {selectedProgram.programName}
                                      </p>
                                      <p>
                                        <strong>University:</strong>{" "}
                                        {selectedProgram.universityName}
                                      </p>
                                      <p>
                                        <strong>Faculty:</strong>{" "}
                                        {selectedProgram.facultyName}
                                      </p>
                                      <p>
                                        <strong>Duration:</strong>{" "}
                                        {selectedProgram.duration}
                                      </p>
                                      <p>
                                        <strong>APS Requirement:</strong>{" "}
                                        {selectedProgram.apsRequirement}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Submission Info
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Submitted by:</strong>{" "}
                                        {selectedProgram.submittedBy}
                                      </p>
                                      <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                          selectedProgram.submittedAt,
                                        ).toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        {getStatusBadge(selectedProgram.status)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {selectedProgram.description}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Subject Requirements
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedProgram.subjects.map(
                                      (subject, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-3 text-sm bg-gray-50 p-2 rounded"
                                        >
                                          <span className="font-medium">
                                            {subject.name}
                                          </span>
                                          <Badge variant="outline">
                                            Level {subject.level}
                                          </Badge>
                                          <Badge
                                            variant={
                                              subject.isRequired
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            {subject.isRequired
                                              ? "Required"
                                              : "Recommended"}
                                          </Badge>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Career Prospects
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProgram.careerProspects.map(
                                      (career, index) => (
                                        <Badge key={index} variant="outline">
                                          {career}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>

                                {selectedProgram.status === "pending" && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        Review Notes (Required for rejection)
                                      </label>
                                      <Textarea
                                        placeholder="Add notes about your review decision..."
                                        value={reviewNotes}
                                        onChange={(e) =>
                                          setReviewNotes(e.target.value)
                                        }
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex space-x-3">
                                      <Button
                                        onClick={() =>
                                          handleApprove(selectedProgram.id)
                                        }
                                        className="flex-1"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Program
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() =>
                                          handleReject(selectedProgram.id)
                                        }
                                        className="flex-1"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Program
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramReview;
