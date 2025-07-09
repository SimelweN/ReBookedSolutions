import React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import Layout from "@/components/Layout";
import UniversityDetailView from "@/components/university-info/UniversityDetailView";

/**
 * University Profile Component
 * Displays detailed information about a specific university using the comprehensive design
 */
const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const university = ALL_SOUTH_AFRICAN_UNIVERSITIES.find(
    (uni) =>
      uni.id === id || uni.name.toLowerCase().replace(/\s+/g, "-") === id,
  );

  if (!university) {
    return <Navigate to="/university-info" replace />;
  }

  const handleBack = () => {
    navigate("/university-info");
  };

  return (
    <Layout>
      <UniversityDetailView university={university} onBack={handleBack} />
    </Layout>
  );
};

export default UniversityProfile;
