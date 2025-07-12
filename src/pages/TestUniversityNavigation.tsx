import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";

const TestUniversityNavigation = () => {
  const navigate = useNavigate();

  const testUniversities = ALL_SOUTH_AFRICAN_UNIVERSITIES.slice(0, 5); // Test first 5

  const handleTestNavigation = (university: any) => {
    console.log("Testing navigation for:", university);
    console.log("University ID:", university.id);
    console.log("University name:", university.name);

    try {
      navigate(`/university/${university.id}`);
      console.log("Navigation successful");
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">University Navigation Test</h2>
      <div className="space-y-4">
        {testUniversities.map((university) => (
          <div key={university.id} className="border p-4 rounded">
            <h3 className="font-semibold">{university.name}</h3>
            <p>ID: {university.id}</p>
            <p>Logo: {university.logo ? "Yes" : "No"}</p>
            <Button
              onClick={() => handleTestNavigation(university)}
              className="mt-2"
            >
              Test Navigation to {university.name}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Manual Tests</h3>
        <Button onClick={() => navigate("/university/uct")} className="mr-2">
          Go to UCT
        </Button>
        <Button onClick={() => navigate("/university/wits")} className="mr-2">
          Go to Wits
        </Button>
        <Button
          onClick={() => navigate("/university/stellenbosch")}
          className="mr-2"
        >
          Go to Stellenbosch
        </Button>
      </div>
    </div>
  );
};

export default TestUniversityNavigation;
