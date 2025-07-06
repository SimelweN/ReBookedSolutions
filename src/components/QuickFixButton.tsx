import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Plus, Zap } from "lucide-react";
import QuickAddressSetup from "@/components/QuickAddressSetup";
import { toast } from "sonner";

interface QuickFixButtonProps {
  onAddressAdded?: () => void;
}

const QuickFixButton = ({ onAddressAdded }: QuickFixButtonProps) => {
  const [showAddressSetup, setShowAddressSetup] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-14 h-14 rounded-full bg-book-600 hover:bg-book-700 shadow-lg"
              size="sm"
            >
              <Zap className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => setShowAddressSetup(true)}
              className="cursor-pointer"
            >
              <MapPin className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">Add Address</div>
                <div className="text-xs text-gray-500">
                  For pickup & delivery
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Address Setup Dialog */}
      <QuickAddressSetup
        isOpen={showAddressSetup}
        onClose={() => setShowAddressSetup(false)}
        onSuccess={() => {
          onAddressAdded?.();
          toast.success("Address added successfully!");
        }}
      />
    </>
  );
};

export default QuickFixButton;
