import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  verifyAllProgramAssignments,
  verifyUniversityPrograms,
  generateVerificationReport,
} from "@/utils/programAssignmentVerification";
import { CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";

/**
 * Demo component to show program assignment verification
 * This helps verify that programs are correctly assigned to universities
 */
const ProgramVerificationDemo: React.FC = () => {
  const [verification, setVerification] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [universityVerification, setUniversityVerification] =
    useState<any>(null);

  const runVerification = () => {
    const result = verifyAllProgramAssignments();
    setVerification(result);
  };

  const verifyUniversity = (universityId: string) => {
    const result = verifyUniversityPrograms(universityId);
    setUniversityVerification(result);
    setSelectedUniversity(universityId);
  };

  const downloadReport = () => {
    const report = generateVerificationReport();
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "program-verification-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const universities = [
    "uct",
    "wits",
    "stellenbosch",
    "up",
    "ukzn",
    "ufs",
    "ru",
    "nwu",
    "uwc",
    "ufh",
    "ul",
    "cput",
    "dut",
    "tut",
    "cut",
    "vut",
    "mut",
    "uj",
    "unisa",
    "unizulu",
    "univen",
    "nmu",
    "wsu",
    "smu",
    "spu",
    "ump",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Program Assignment Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This tool verifies that programs are correctly assigned to
            universities according to the official prospectus rules.
          </p>

          <div className="flex gap-2">
            <Button onClick={runVerification}>Run Full Verification</Button>
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>

          {verification && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Verification Results:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Programs:</span>
                  <div className="text-lg">{verification.totalPrograms}</div>
                </div>
                <div>
                  <span className="font-medium text-green-600">Correct:</span>
                  <div className="text-lg text-green-600">
                    {verification.correctPrograms}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-red-600">Incorrect:</span>
                  <div className="text-lg text-red-600">
                    {verification.incorrectPrograms}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-orange-600">Issues:</span>
                  <div className="text-lg text-orange-600">
                    {verification.summary.missingAssignments +
                      verification.summary.unexpectedAssignments}
                  </div>
                </div>
              </div>

              {verification.incorrectPrograms > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-600 mb-2">
                    Programs with Issues:
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {verification.results
                      .filter((r: any) => !r.isCorrect)
                      .slice(0, 10) // Show first 10 issues
                      .map((result: any) => (
                        <div
                          key={result.programId}
                          className="p-2 bg-red-50 rounded border border-red-200"
                        >
                          <div className="font-medium">
                            {result.programName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Rule: {result.rule}
                          </div>
                          <div className="text-sm text-red-600">
                            {result.errors.length} issue
                            {result.errors.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>University-Specific Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select University:
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedUniversity}
              onChange={(e) => verifyUniversity(e.target.value)}
            >
              <option value="">Choose a university...</option>
              {universities.map((uni) => (
                <option key={uni} value={uni}>
                  {uni.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {universityVerification && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">
                {universityVerification.universityId.toUpperCase()} Results:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Total:</span>
                  <div className="text-lg">
                    {universityVerification.summary.total}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-green-600">Correct:</span>
                  <div className="text-lg text-green-600">
                    {universityVerification.summary.correct}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-red-600">Missing:</span>
                  <div className="text-lg text-red-600">
                    {universityVerification.summary.missing}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-orange-600">
                    Unexpected:
                  </span>
                  <div className="text-lg text-orange-600">
                    {universityVerification.summary.unexpected}
                  </div>
                </div>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {universityVerification.programs
                  .filter((p: any) => !p.isCorrect)
                  .slice(0, 10)
                  .map((program: any) => (
                    <div
                      key={program.programId}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <span className="text-sm">{program.programId}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={program.shouldHave ? "default" : "secondary"}
                        >
                          Should: {program.shouldHave ? "Yes" : "No"}
                        </Badge>
                        <Badge
                          variant={
                            program.actuallyHas ? "default" : "secondary"
                          }
                        >
                          Has: {program.actuallyHas ? "Yes" : "No"}
                        </Badge>
                        {program.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramVerificationDemo;
