import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import {
  getAllContactMessages,
  markMessageAsRead,
  ContactMessage,
} from "@/services/contactService";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactMessageTable } from "./contact/ContactMessageTable";

const AdminContactTab = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getAllContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read" } : msg,
        ),
      );
      toast.success("Message marked as read");
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark message as read");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <CardTitle>Contact Messages</CardTitle>
        </div>
        <CardDescription>Manage and respond to user inquiries</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No contact messages yet</p>
          </div>
        ) : (
          <ContactMessageTable
            messages={messages}
            isMobile={isMobile}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContactTab;
