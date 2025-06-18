import Layout from "@/components/Layout";

const PoliciesTest = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Policies Page Test</h1>
        <p>
          If you can see this, the route is working and the issue is with the
          main Policies component.
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded">
          <p>✅ Route is working correctly</p>
          <p>✅ Layout component is working</p>
          <p>✅ Basic rendering is functional</p>
        </div>
      </div>
    </Layout>
  );
};

export default PoliciesTest;
