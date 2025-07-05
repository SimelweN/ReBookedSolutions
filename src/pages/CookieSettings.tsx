import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import CookieSettingsComponent from "@/components/CookieSettings";

const CookieSettingsPage = () => {
  return (
    <Layout>
      <SEO
        title="Cookie Settings - ReBooked Solutions"
        description="Manage your cookie preferences and privacy settings. Control functional and analytics cookies while maintaining site functionality."
        keywords="cookies, privacy, POPIA, GDPR, data protection, settings"
        url="https://www.rebookedsolutions.co.za/cookie-settings"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CookieSettingsComponent />
      </div>
    </Layout>
  );
};

export default CookieSettingsPage;
