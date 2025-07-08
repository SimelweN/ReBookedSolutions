import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailTest {
  id: string;
  type: string;
  status: "pending" | "sending" | "sent" | "failed";
  to: string;
  template?: string;
  timestamp: string;
  message?: string;
}

const EMAIL_TEMPLATES = {
  welcome: "Welcome Email",
  book_sold: "Book Sold Notification",
  book_purchased: "Book Purchase Confirmation",
  commit_reminder: "Commit Reminder",
  sale_expired: "Sale Expired",
  password_reset: "Password Reset",
};

const EmailTester = () => {
  const [tests, setTests] = useState<EmailTest[]>([]);
  const [customEmail, setCustomEmail] = useState({
    to: "",
    subject: "",
    htmlContent: "",
    textContent: "",
  });
  const [templateEmail, setTemplateEmail] = useState({
    to: "",
    templateId: "",
    variables: "{}",
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateTestStatus = (
    id: string,
    status: EmailTest["status"],
    message?: string,
  ) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === id ? { ...test, status, message } : test,
      ),
    );
  };

  const sendCustomEmail = async () => {
    if (!customEmail.to || !customEmail.subject) {
      toast.error("Please fill in required fields");
      return;
    }

    const testId = Date.now().toString();
    const newTest: EmailTest = {
      id: testId,
      type: "Custom Email",
      status: "sending",
      to: customEmail.to,
      timestamp: new Date().toISOString(),
    };

    setTests((prev) => [newTest, ...prev]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          body: {
            action: "send",
            to: customEmail.to,
            subject: customEmail.subject,
            htmlContent:
              customEmail.htmlContent || `<p>${customEmail.textContent}</p>`,
            textContent: customEmail.textContent,
          },
        },
      );

      if (error) throw error;

      updateTestStatus(testId, "sent", "Email sent successfully");
      toast.success("Custom email sent successfully!");

      // Clear form
      setCustomEmail({ to: "", subject: "", htmlContent: "", textContent: "" });
    } catch (error: any) {
      updateTestStatus(testId, "failed", error.message);
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTemplateEmail = async () => {
    if (!templateEmail.to || !templateEmail.templateId) {
      toast.error("Please select template and enter recipient email");
      return;
    }

    const testId = Date.now().toString();
    const newTest: EmailTest = {
      id: testId,
      type: "Template Email",
      status: "sending",
      to: templateEmail.to,
      template:
        EMAIL_TEMPLATES[
          templateEmail.templateId as keyof typeof EMAIL_TEMPLATES
        ],
      timestamp: new Date().toISOString(),
    };

    setTests((prev) => [newTest, ...prev]);
    setIsLoading(true);

    try {
      let variables = {};
      try {
        variables = JSON.parse(templateEmail.variables);
      } catch {
        variables = {};
      }

      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          body: {
            action: "send-template",
            templateId: templateEmail.templateId,
            to: templateEmail.to,
            variables,
          },
        },
      );

      if (error) throw error;

      updateTestStatus(testId, "sent", "Template email sent successfully");
      toast.success("Template email sent successfully!");

      // Clear form
      setTemplateEmail({ to: "", templateId: "", variables: "{}" });
    } catch (error: any) {
      updateTestStatus(testId, "failed", error.message);
      toast.error(`Failed to send template email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailAutomation = async () => {
    const testEmail = "test@example.com";
    const testId = Date.now().toString();

    const newTest: EmailTest = {
      id: testId,
      type: "Automation Test",
      status: "sending",
      to: testEmail,
      timestamp: new Date().toISOString(),
    };

    setTests((prev) => [newTest, ...prev]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          body: {
            action: "trigger-automation",
            trigger: "user_registered",
            data: {
              email: testEmail,
              name: "Test User",
            },
          },
        },
      );

      if (error) throw error;

      updateTestStatus(testId, "sent", "Automation trigger sent successfully");
      toast.success("Email automation triggered successfully!");
    } catch (error: any) {
      updateTestStatus(testId, "failed", error.message);
      toast.error(`Failed to trigger automation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestVariablesExample = (templateId: string) => {
    const examples = {
      welcome: '{"name": "John Doe", "siteUrl": "https://rebooked.co.za"}',
      book_sold:
        '{"sellerName": "John", "bookTitle": "Physics 101", "bookAuthor": "Dr. Smith", "buyerName": "Jane", "salePrice": "500", "sellerAmount": "450", "orderReference": "ORD123", "commitUrl": "https://rebooked.co.za/commit/123"}',
      book_purchased:
        '{"buyerName": "Jane", "bookTitle": "Physics 101", "bookAuthor": "Dr. Smith", "sellerName": "John", "totalAmount": "500", "orderReference": "ORD123", "orderUrl": "https://rebooked.co.za/orders/123"}',
      commit_reminder:
        '{"sellerName": "John", "bookTitle": "Physics 101", "commitUrl": "https://rebooked.co.za/commit/123"}',
      sale_expired:
        '{"buyerName": "Jane", "bookTitle": "Physics 101", "refundAmount": "500", "browseUrl": "https://rebooked.co.za/books"}',
      password_reset:
        '{"name": "John", "resetUrl": "https://rebooked.co.za/reset-password?token=abc123"}',
    };
    return examples[templateId as keyof typeof examples] || "{}";
  };

  const getStatusIcon = (status: EmailTest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "sending":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: EmailTest["status"]) => {
    const variants = {
      pending: "secondary",
      sending: "default",
      sent: "default",
      failed: "destructive",
    } as const;

    const colors = {
      pending: "text-gray-600 bg-gray-100",
      sending: "text-blue-600 bg-blue-100",
      sent: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Custom Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Custom Email Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-to">To Email</Label>
              <Input
                id="custom-to"
                type="email"
                placeholder="recipient@example.com"
                value={customEmail.to}
                onChange={(e) =>
                  setCustomEmail((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-subject">Subject</Label>
              <Input
                id="custom-subject"
                placeholder="Email subject"
                value={customEmail.subject}
                onChange={(e) =>
                  setCustomEmail((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-html">HTML Content (Optional)</Label>
            <Textarea
              id="custom-html"
              placeholder="<h1>Hello World</h1><p>This is a test email</p>"
              rows={4}
              value={customEmail.htmlContent}
              onChange={(e) =>
                setCustomEmail((prev) => ({
                  ...prev,
                  htmlContent: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-text">Text Content</Label>
            <Textarea
              id="custom-text"
              placeholder="Plain text version of your email"
              rows={3}
              value={customEmail.textContent}
              onChange={(e) =>
                setCustomEmail((prev) => ({
                  ...prev,
                  textContent: e.target.value,
                }))
              }
            />
          </div>
          <Button
            onClick={sendCustomEmail}
            disabled={isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Custom Email
          </Button>
        </CardContent>
      </Card>

      {/* Template Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template Email Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-to">To Email</Label>
              <Input
                id="template-to"
                type="email"
                placeholder="recipient@example.com"
                value={templateEmail.to}
                onChange={(e) =>
                  setTemplateEmail((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-select">Email Template</Label>
              <Select
                value={templateEmail.templateId}
                onValueChange={(value) => {
                  setTemplateEmail((prev) => ({
                    ...prev,
                    templateId: value,
                    variables: getTestVariablesExample(value),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMAIL_TEMPLATES).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-variables">
              Template Variables (JSON)
            </Label>
            <Textarea
              id="template-variables"
              placeholder='{"name": "John Doe", "siteUrl": "https://rebooked.co.za"}'
              rows={4}
              value={templateEmail.variables}
              onChange={(e) =>
                setTemplateEmail((prev) => ({
                  ...prev,
                  variables: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={sendTemplateEmail}
              disabled={isLoading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Template Email
            </Button>
            <Button
              onClick={testEmailAutomation}
              disabled={isLoading}
              variant="outline"
            >
              Test Automation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Email Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <Alert>
              <AlertDescription>
                No email tests run yet. Send an email above to see results here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-500">
                        To: {test.to}{" "}
                        {test.template && `• Template: ${test.template}`}
                      </div>
                      {test.message && (
                        <div className="text-sm text-gray-600 mt-1">
                          {test.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <div className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTester;
