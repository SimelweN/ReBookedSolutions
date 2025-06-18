import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DeleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteProfileDialog = ({ isOpen, onClose }: DeleteProfileDialogProps) => {
  const { user, profile } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user || confirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      // Here you would implement the actual profile deletion logic
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Profile deletion request submitted. You will receive an email confirmation.",
      );
      onClose();

      // Reset form
      setConfirmText("");
    } catch (error) {
      toast.error("Failed to delete profile. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Profile
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-semibold mb-2">
              What will be deleted:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your profile and account information</li>
              <li>• All your book listings</li>
              <li>• Your transaction history</li>
              <li>• Your saved addresses</li>
              <li>• All notifications and messages</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            Please type <strong>DELETE</strong> to confirm you want to
            permanently delete your account.
          </p>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">Type 'DELETE' to confirm</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete Profile
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProfileDialog;
