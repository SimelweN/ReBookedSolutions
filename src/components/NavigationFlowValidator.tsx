import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Navigation,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  User,
  GraduationCap,
  BookOpen,
  ShoppingCart,
  LogIn,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationTest {
  id: string;
  name: string;
  path: string;
  description: string;
  status: "pending" | "testing" | "passed" | "failed";
  error?: string;
  dependencies?: string[];
}

const NavigationFlowValidator = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState<NavigationTest[]>([
    {
      id: "home",
      name: "Homepage",
      path: "/",
      description: "Main landing page loads correctly",
      status: "pending",
    },
    {
      id: "campus",
      name: "Campus Page",
      path: "/university-info",
      description: "University info and campus tools",
      status: "pending",
    },
    {
      id: "login",
      name: "Login Page",
      path: "/login",
      description: "Authentication page accessibility",
      status: "pending",
    },
    {
      id: "marketplace",
      name: "Marketplace",
      path: "/books",
      description: "Book listing and browsing",
      status: "pending",
    },
    {
      id: "cart",
      name: "Shopping Cart",
      path: "/cart",
      description: "Shopping cart functionality",
      status: "pending",
      dependencies: ["login"],
    },
    {
      id: "profile",
      name: "User Profile",
      path: "/profile",
      description: "User profile and settings",
      status: "pending",
      dependencies: ["login"],
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Critical user flows to test
  const userFlows = [
    {
      id: "campus-to-login",
      name: "Campus → Login",
      description: "User navigates from campus page to login",
      steps: ["/university-info", "/login"],
    },
    {
      id: "login-to-marketplace",
      name: "Login → Marketplace",
      description: "After login, user browses books",
      steps: ["/login", "/books"],
    },
    {
      id: "marketplace-to-cart",
      name: "Marketplace → Cart",
      description: "User adds books and checks cart",
      steps: ["/books", "/cart"],
    },
    {
      id: "campus-to-marketplace",
      name: "Campus → Marketplace",
      description: "Direct navigation from campus to books",
      steps: ["/university-info", "/books"],
    },
  ];

  const testNavigation = async (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: "testing" } : test,
      ),
    );

    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    try {
      // Check dependencies first
      if (test.dependencies) {
        for (const dep of test.dependencies) {
          const depTest = tests.find((t) => t.id === dep);
          if (depTest?.status !== "passed") {
            throw new Error(`Dependency ${dep} not satisfied`);
          }
        }
      }

      // Special handling for protected routes
      if (
        (test.path === "/profile" || test.path === "/cart") &&
        !isAuthenticated
      ) {
        setTests((prev) =>
          prev.map((t) =>
            t.id === testId
              ? {
                  ...t,
                  status: "failed",
                  error: "Authentication required for this route",
                }
              : t,
          ),
        );
        return;
      }

      // Test navigation
      const startTime = Date.now();

      // Create a promise that resolves when navigation completes
      const navigationPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Navigation timeout"));
        }, 5000);

        // Listen for route changes
        const checkNavigation = () => {
          if (window.location.pathname === test.path) {
            clearTimeout(timeout);
            resolve(true);
          } else {
            setTimeout(checkNavigation, 100);
          }
        };

        checkNavigation();
      });

      // Attempt navigation
      navigate(test.path);

      // Wait for navigation to complete
      await navigationPromise;

      const endTime = Date.now();
      const duration = endTime - startTime;

      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? {
                ...t,
                status: "passed",
                error: undefined,
              }
            : t,
        ),
      );

      toast.success(`✅ ${test.name} navigation successful (${duration}ms)`);
    } catch (error) {
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? {
                ...t,
                status: "failed",
                error: error instanceof Error ? error.message : String(error),
              }
            : t,
        ),
      );

      toast.error(`❌ ${test.name} navigation failed`);
    }
  };

  const testUserFlow = async (flowId: string) => {
    const flow = userFlows.find((f) => f.id === flowId);
    if (!flow) return;

    toast.info(`Testing flow: ${flow.name}`);

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];

      try {
        navigate(step);

        // Wait for navigation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (window.location.pathname !== step) {
          throw new Error(`Failed to navigate to ${step}`);
        }

        toast.success(`✅ Step ${i + 1}: ${step}`);
      } catch (error) {
        toast.error(`❌ Flow failed at step ${i + 1}: ${step}`);
        return;
      }
    }

    toast.success(`🎉 User flow "${flow.name}" completed successfully!`);
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Reset all tests
    setTests((prev) =>
      prev.map((test) => ({ ...test, status: "pending", error: undefined })),
    );

    // Run tests in order (dependencies first)
    const testOrder = [
      "home",
      "campus",
      "login",
      "marketplace",
      "cart",
      "profile",
    ];

    for (const testId of testOrder) {
      await testNavigation(testId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);

    const passedTests = tests.filter((t) => t.status === "passed").length;
    const totalTests = tests.length;

    if (passedTests === totalTests) {
      toast.success("🎉 All navigation tests passed!");
    } else {
      toast.warning(`${passedTests}/${totalTests} navigation tests passed`);
    }
  };

  const getStatusIcon = (status: NavigationTest["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "testing":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: NavigationTest["status"]) => {
    switch (status) {
      case "passed":
        return "border-green-200 bg-green-50";
      case "failed":
        return "border-red-200 bg-red-50";
      case "testing":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getRouteIcon = (path: string) => {
    switch (path) {
      case "/":
        return <Home className="w-4 h-4" />;
      case "/university-info":
        return <GraduationCap className="w-4 h-4" />;
      case "/login":
        return <LogIn className="w-4 h-4" />;
      case "/books":
        return <BookOpen className="w-4 h-4" />;
      case "/cart":
        return <ShoppingCart className="w-4 h-4" />;
      case "/profile":
        return <User className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  // Update current path when location changes
  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Location */}
      <Alert className="border-blue-200 bg-blue-50">
        <Navigation className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Current Location:</strong> {currentPath}
          {isAuthenticated && " (Authenticated)"}
        </AlertDescription>
      </Alert>

      {/* Navigation Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Navigation Flow Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
              />
              {isRunning ? "Testing..." : "Test All Routes"}
            </Button>
          </div>

          <div className="grid gap-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRouteIcon(test.path)}
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <code className="text-xs bg-gray-100 px-1 rounded">
                      {test.path}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{test.status.toUpperCase()}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testNavigation(test.id)}
                      disabled={test.status === "testing" || isRunning}
                    >
                      {test.status === "testing" ? "Testing..." : "Test"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-1 text-gray-600">{test.description}</p>
                {test.error && (
                  <p className="text-xs mt-1 text-red-600">
                    Error: {test.error}
                  </p>
                )}
                {test.dependencies && (
                  <p className="text-xs mt-1 text-gray-500">
                    Depends on: {test.dependencies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Flow Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5" />
            <span>User Flow Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userFlows.map((flow) => (
            <div
              key={flow.id}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{flow.name}</h4>
                  <p className="text-sm text-gray-600">{flow.description}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {flow.steps.map((step, index) => (
                      <div key={step} className="flex items-center">
                        <code className="text-xs bg-white px-1 rounded">
                          {step}
                        </code>
                        {index < flow.steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testUserFlow(flow.id)}
                  disabled={isRunning}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Test Flow
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationFlowValidator;
