import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ModernAddressInput from "@/components/ModernAddressInput";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface QuickAddressSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const QuickAddressSetup = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Add Your Address",
  description = "We need your address so buyers know where to collect books from you.",
}: QuickAddressSetupProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  const handleAddressUpdate = (address: Address) => {
    setCurrentAddress(address);
  };

  const handleSave = async () => {
    if (!currentAddress || !user?.id) {
      toast.error("Please select an address and ensure you're logged in");
      return;
    }

    // Check if address is complete
    const isComplete = Object.values(currentAddress).every(
      (val) => val.trim() !== "",
    );
    if (!isComplete) {
      toast.error("Please complete all address fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          pickup_address: {
            street: currentAddress.street,
            city: currentAddress.city,
            province: currentAddress.province,
            postalCode: currentAddress.postalCode,
            streetAddress: currentAddress.street, // For compatibility
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("✅ Address saved successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAddressComplete =
    currentAddress &&
    Object.values(currentAddress).every((val) => val.trim() !== "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ModernAddressInput
            onAddressUpdate={handleAddressUpdate}
            title=""
            description="This is where buyers will collect books from you."
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isAddressComplete || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-book-600 border border-transparent rounded-md hover:bg-book-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-book-500 disabled:opacity-50 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddressSetup;
