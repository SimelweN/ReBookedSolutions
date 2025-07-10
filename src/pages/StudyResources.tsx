import CampusNavbar from "@/components/CampusNavbar";
import SEO from "@/components/SEO";
import StudyResourcesPage from "@/components/university-info/study-resources/StudyResourcesPage";

const StudyResources = () => {
  return (
    <>
      <SEO
        title="Study Resources & Tips - ReBooked Solutions"
        description="Discover study tips, guides, and resources to help you succeed in your academic journey. Access university-specific content, exam preparation materials, and learning strategies."
        keywords="study tips, study guides, university resources, exam preparation, academic success, learning strategies"
      />

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
