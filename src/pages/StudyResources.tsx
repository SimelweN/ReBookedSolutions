import { Helmet } from "react-helmet-async";
import CampusNavbar from "@/components/CampusNavbar";
import StudyResourcesPage from "@/components/university-info/study-resources/StudyResourcesPage";

const StudyResources = () => {
  return (
    <>
      <Helmet>
        <title>Study Resources & Tips - ReBooked Solutions</title>
        <meta
          name="description"
          content="Discover study tips, guides, and resources to help you succeed in your academic journey. Access university-specific content, exam preparation materials, and learning strategies."
        />
        <meta
          name="keywords"
          content="study tips, study guides, university resources, exam preparation, academic success, learning strategies"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <CampusNavbar />
        <main className="pt-16">
          <StudyResourcesPage />
        </main>
      </div>
    </>
  );
};

export default StudyResources;
