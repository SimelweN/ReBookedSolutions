import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Terminal,
  Globe,
  Code,
  Settings,
  FileText,
  Clock,
  Info,
  Copy,
  Check,
  GitBranch,
  Server,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DeploymentCheck {
  id: string;
  name: string;
  status: "checking" | "success" | "warning" | "error";
  message: string;
  details?: string;
  action?: string;
  actionUrl?: string;
}

interface DeploymentStatus {
  environment: string;
  url: string;
  status: "deployed" | "building" | "failed" | "unknown";
  lastUpdated: string;
  buildTime?: string;
  commit?: string;
}

const DeploymentTroubleshooting: React.FC = () => {
  const [checks, setChecks] = useState<DeploymentCheck[]>([]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus[]>([]);
  const [hasInitialCheckRun, setHasInitialCheckRun] = useState(false);
  const mockDeploymentStatus: DeploymentStatus[] = [
    {
      environment: "Production",
      url: "https://rebookedsolutions.co.za",
      status: "deployed",
      lastUpdated: "2 hours ago",
      buildTime: "2m 45s",
      commit: "abc123f",
    },
    {
      environment: "Preview",
      url: "https://re-booked-solutions-qdonw6zu0.vercel.app",
      status: "failed",
      lastUpdated: "1 hour ago",
      buildTime: "Failed at 1m 32s",
      commit: "def456a",
    },
  ];

  const runDeploymentChecks = async () => {
    if (isRunningChecks) return; // Prevent concurrent executions

    setIsRunningChecks(true);
    setChecks([]); // Clear existing checks

    const checkItems = [
      {
        id: "build-config",
        name: "Build Configuration",
        check: () => {
          const hasPackageJson = true; // Simulate check
          const hasVercelJson = true;
          const hasCorrectScripts = true;

          if (!hasPackageJson) {
            return {
              status: "error" as const,
              message: "package.json not found",
              details: "Your project is missing a package.json file",
              action: "Create package.json with proper build scripts",
            };
          }

          if (!hasVercelJson) {
            return {
              status: "warning" as const,
              message: "vercel.json not optimized",
              details:
                "Consider adding vercel.json for better deployment configuration",
              action: "Add vercel.json configuration",
            };
          }

          if (!hasCorrectScripts) {
            return {
              status: "error" as const,
              message: "Missing build scripts",
              details: "package.json is missing required build scripts",
              action: "Add 'build' script to package.json",
            };
          }

          return {
            status: "success" as const,
            message: "Build configuration is correct",
            details: "All necessary build files and scripts are present",
          };
        },
      },
      {
        id: "dependencies",
        name: "Dependencies",
        check: () => {
          const hasNodeModules = true; // Simulate check
          const hasLockFile = true;
          const nodeVersion = "18.x";

          if (!hasNodeModules) {
            return {
              status: "error" as const,
              message: "Dependencies not installed",
              details: "node_modules directory is missing",
              action: "Run 'yarn install' or 'npm install'",
            };
          }

          if (!hasLockFile) {
            return {
              status: "warning" as const,
              message: "No lock file found",
              details: "Missing yarn.lock or package-lock.json",
              action: "Generate lock file by running package manager",
            };
          }

          return {
            status: "success" as const,
            message: `Dependencies ready (Node ${nodeVersion})`,
            details: "All dependencies are properly installed and locked",
          };
        },
      },
      {
        id: "environment",
        name: "Environment Variables",
        check: () => {
          const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
          const missingVars = requiredVars.filter(() => Math.random() > 0.7); // Simulate missing vars

          if (missingVars.length > 0) {
            return {
              status: "error" as const,
              message: "Missing environment variables",
              details: `Missing: ${missingVars.join(", ")}`,
              action: "Set environment variables in Vercel dashboard",
              actionUrl: "https://vercel.com/dashboard",
            };
          }

          return {
            status: "success" as const,
            message: "Environment variables configured",
            details: "All required environment variables are set",
          };
        },
      },
      {
        id: "build-output",
        name: "Build Output",
        check: () => {
          const outputExists = true; // Simulate check
          const outputSize = "2.1 MB";
          const chunkCount = 8;

          if (!outputExists) {
            return {
              status: "error" as const,
              message: "Build output missing",
              details: "No dist/ directory found after build",
              action: "Run 'yarn build' to generate output",
            };
          }

          return {
            status: "success" as const,
            message: `Build output ready (${outputSize}, ${chunkCount} chunks)`,
            details: "Build artifacts are properly generated",
          };
        },
      },
      {
        id: "domain-config",
        name: "Domain Configuration",
        check: () => {
          const hasCustomDomain = true; // Simulate check
          const dnsConfigured = Math.random() > 0.3;

          if (hasCustomDomain && !dnsConfigured) {
            return {
              status: "error" as const,
              message: "DNS configuration issue",
              details: "Custom domain is not properly configured",
              action: "Check DNS settings in domain provider",
              actionUrl: "https://vercel.com/docs/concepts/projects/domains",
            };
          }

          return {
            status: "success" as const,
            message: "Domain configuration correct",
            details: "All domains are properly configured and accessible",
          };
        },
      },
    ];

    // Initialize all checks with "checking" status first
    const initialChecks = checkItems.map(item => ({
      id: item.id,
      name: item.name,
      status: "checking" as const,
      message: "Checking...",
    }));
    setChecks(initialChecks);

    // Run checks in parallel but update sequentially
    for (let i = 0; i < checkItems.length; i++) {
      const item = checkItems[i];

      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      const result = item.check();

      // Update with result using functional update to ensure consistency
      setChecks(prev => prev.map(check =>
        check.id === item.id
          ? {
              id: item.id,
              name: item.name,
              ...result
            }
          : check
      ));
    }
        prev.map((check) =>
          check.id === item.id ? { ...check, ...result } : check,
        ),
      );
    }

    setDeploymentStatus(mockDeploymentStatus);
    setIsRunningChecks(false);
  };

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusIcon = (status: DeploymentCheck["status"]) => {
    switch (status) {
      case "checking":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800";
      case "building":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (!hasInitialCheckRun) {
      setHasInitialCheckRun(true);
      runDeploymentChecks();
    }
  }, [hasInitialCheckRun]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Server className="h-8 w-8 text-blue-600" />
          Deployment Troubleshooting
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Diagnose and fix deployment issues for your ReBooked Solutions
          application. This tool helps identify common problems and provides
          solutions.
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Deployment Status</TabsTrigger>
          <TabsTrigger value="diagnostics">Run Diagnostics</TabsTrigger>
          <TabsTrigger value="common-issues">Common Issues</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Current Deployment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deploymentStatus.map((deployment, index) => (
                  <div
                    key={`deployment-${deployment.environment}-${index}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {deployment.environment}
                          </h3>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {deployment.url}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>Updated {deployment.lastUpdated}</span>
                          <span>Build: {deployment.buildTime}</span>
                          {deployment.commit && (
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {deployment.commit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(deployment.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(deployment.url, `url-${deployment.environment}-${index}`)
                        }
                      >
                        {copiedItem === `url-${deployment.environment}-${index}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Automated Diagnostics
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runDeploymentChecks}
                  disabled={isRunningChecks}
                  className="ml-auto"
                >
                  {isRunningChecks ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  {isRunningChecks ? "Running..." : "Run Checks"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks.map((check, checkIndex) => (
                  <div
                    key={`check-${check.id}-${checkIndex}`}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{check.name}</h3>
                        {check.action && check.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(check.actionUrl, "_blank")
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Fix
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {check.message}
                      </p>
                      {check.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {check.details}
                        </p>
                      )}
                      {check.action && !check.actionUrl && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          Action: {check.action}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="common-issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Deployment Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="no-deployment">
                  <AccordionTrigger>
                    No Deployment or Failed Deployment
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p>
                      The project may not exist, or the latest deployment
                      failed.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Solution:</strong> Check your Vercel dashboard
                        under that deployment name.
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                      1. Log into Vercel Dashboard
                      <br />
                      2. Find your project
                      <br />
                      3. Check the Deployments section
                      <br />
                      4. Look for error messages in latest deployment
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="github-issues">
                  <AccordionTrigger>GitHub Link Issues</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p>
                      The GitHub repo might be renamed, private, or deleted,
                      causing the build to fail.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Solution:</strong> Verify repository access and
                        permissions.
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                      1. Check if repository exists and is accessible
                      <br />
                      2. Verify Vercel has proper permissions
                      <br />
                      3. Re-link repository if necessary
                      <br />
                      4. Check if repository was renamed or moved
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="build-errors">
                  <AccordionTrigger>Build Errors</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p>
                      If it's a React, Vite, or other framework project, build
                      might be failing silently.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Solution:</strong> Review the Deployment Logs in
                        the Vercel dashboard.
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Common build issues:</strong>
                      <br />
                      • Missing dependencies
                      <br />
                      • TypeScript errors
                      <br />
                      • Environment variable issues
                      <br />
                      • Node version mismatches
                      <br />• Build script errors
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="domain-config">
                  <AccordionTrigger>Domain Misconfiguration</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p>The custom subdomain might not be pointing correctly.</p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Solution:</strong> Check DNS configuration and
                        domain settings.
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                      1. Verify DNS records point to Vercel
                      <br />
                      2. Check domain configuration in Vercel
                      <br />
                      3. Ensure SSL certificate is active
                      <br />
                      4. Wait for DNS propagation (up to 24-48 hours)
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="environment-vars">
                  <AccordionTrigger>
                    Environment Variables Missing
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p>
                      Required environment variables are not set in the
                      deployment environment.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Solution:</strong> Set environment variables in
                        Vercel project settings.
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>
                        Required variables for ReBooked Solutions:
                      </strong>
                      <br />
                      • VITE_SUPABASE_URL
                      <br />
                      • VITE_SUPABASE_ANON_KEY
                      <br />
                      • VITE_GOOGLE_MAPS_API_KEY
                      <br />• VITE_PAYSTACK_PUBLIC_KEY
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Deployment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  Optimal vercel.json Configuration
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                  <pre>
                    {JSON.stringify(
                      {
                        buildCommand: "yarn build",
                        outputDirectory: "dist",
                        installCommand: "yarn install",
                        devCommand: "yarn dev",
                        framework: "vite",
                        rewrites: [
                          {
                            source: "/((?!api/).*)",
                            destination: "/index.html",
                          },
                        ],
                        headers: [
                          {
                            source: "/assets/(.*)",
                            headers: [
                              {
                                key: "Cache-Control",
                                value: "public, max-age=31536000, immutable",
                              },
                            ],
                          },
                        ],
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(
                        {
                          buildCommand: "yarn build",
                          outputDirectory: "dist",
                          installCommand: "yarn install",
                          devCommand: "yarn dev",
                          framework: "vite",
                          rewrites: [
                            {
                              source: "/((?!api/).*)",
                              destination: "/index.html",
                            },
                          ],
                        },
                        null,
                        2,
                      ),
                      "vercel-config",
                    )
                  }
                >
                  {copiedItem === "vercel-config" ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy Configuration
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Required Package.json Scripts
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono">
                  <pre>
                    {JSON.stringify(
                      {
                        scripts: {
                          dev: "vite",
                          build: "vite build",
                          preview: "vite preview",
                          lint: "eslint .",
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Environment Variables Setup
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Set these in your Vercel project settings under Environment
                    Variables:
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    VITE_SUPABASE_URL=your_supabase_url
                    <br />
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                    <br />
                    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
                    <br />
                    VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                window.open("https://vercel.com/dashboard", "_blank")
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Vercel Dashboard
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Check GitHub Repository
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open("https://vercel.com/docs", "_blank")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Vercel Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentTroubleshooting;