import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SimpleAddressForm from "@/components/SimpleAddressForm";

interface QuickAddressSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

const QuickAddressSetup = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Add Your Address",
  description = "We need your address so buyers know where to collect books from you.",
}: QuickAddressSetupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <SimpleAddressForm
          title={title}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddressSetup;
