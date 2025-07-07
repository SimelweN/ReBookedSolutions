import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBook } from "@/services/book/bookMutations";
import { BookFormData } from "@/types/book";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import MultiImageUpload from "@/components/MultiImageUpload";
import FirstUploadSuccessDialog from "@/components/FirstUploadSuccessDialog";
import PostListingSuccessDialog from "@/components/PostListingSuccessDialog";
import ShareProfileDialog from "@/components/ShareProfileDialog";
import SellerPolicyModal from "@/components/SellerPolicyModal";
import CommitReminderModal from "@/components/CommitReminderModal";
import {
  hasCompletedFirstUpload,
  markFirstUploadCompleted,
} from "@/services/userPreferenceService";
import { BookInformationForm } from "@/components/create-listing/BookInformationForm";
import { PricingSection } from "@/components/create-listing/PricingSection";
import { BookTypeSection } from "@/components/create-listing/BookTypeSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { SellerValidationService } from "@/services/sellerValidationService";
import SellerRestrictionBanner from "@/components/SellerRestrictionBanner";
import BankingRequirementGate from "@/components/BankingRequirementGate";

const CreateListing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    price: 0,
    condition: "Good",
    category: "",
    grade: "",
    universityYear: "",
    imageUrl: "",
    frontCover: "",
    backCover: "",
    insidePages: "",
  });

  const [sellerValidation, setSellerValidation] = useState<any>(null);
  const [isCheckingRequirements, setIsCheckingRequirements] = useState(true);

  const [bookImages, setBookImages] = useState({
    frontCover: "",
    backCover: "",
    insidePages: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookType, setBookType] = useState<"school" | "university">("school");
  const [showFirstUploadDialog, setShowFirstUploadDialog] = useState(false);
  const [showPostListingDialog, setShowPostListingDialog] = useState(false);
  const [showShareProfileDialog, setShowShareProfileDialog] = useState(false);
  const [showSellerPolicyModal, setShowSellerPolicyModal] = useState(false);
  const [showCommitReminderModal, setShowCommitReminderModal] = useState(false);
  const [sellerPolicyAccepted, setSellerPolicyAccepted] = useState(false);
  const [canListBooks, setCanListBooks] = useState<boolean | null>(null);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if user can list books on component mount
  useEffect(() => {
    const checkUserRequirements = async () => {
      if (!user) {
        setCanListBooks(false);
        setValidationErrors(["Please log in to list books"]);
        setIsCheckingRequirements(false);
        return;
      }

      try {
        const validation =
          await SellerValidationService.validateSellerRequirements(user.id);
        setSellerValidation(validation);
        setCanListBooks(validation.canSell);
        setValidationErrors(validation.missingRequirements);

        if (!validation.canSell) {
          console.log(
            "User cannot list books. Missing requirements:",
            validation.missingRequirements,
          );
        }
      } catch (error) {
        console.error("Error checking user requirements:", error);
        setCanListBooks(false);
        setValidationErrors(["Error checking account requirements"]);
      } finally {
        setIsCheckingRequirements(false);
      }
    };

    checkUserRequirements();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;

    if (name === "price") {
      // Handle price input more carefully
      const numericValue = parseFloat(value);
      processedValue = isNaN(numericValue) ? 0 : numericValue;
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBookTypeChange = (type: "school" | "university") => {
    setBookType(type);
    if (type === "school") {
      setFormData({ ...formData, universityYear: "", university: "" });
    } else {
      setFormData({ ...formData, grade: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required (must be greater than 0)";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";

    if (bookType === "school" && !formData.grade) {
      newErrors.grade = "Grade is required for school books";
    }

    if (!bookImages.frontCover)
      newErrors.frontCover = "Front cover photo is required";
    if (!bookImages.backCover)
      newErrors.backCover = "Back cover photo is required";
    if (!bookImages.insidePages)
      newErrors.insidePages = "Inside pages photo is required";

    if (!sellerPolicyAccepted)
      newErrors.sellerPolicy =
        "You must accept the Seller Policy and platform rules";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    if (!user) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    // ❗ DISALLOW listing books if seller has no subaccount or address
    if (canListBooks === false) {
      toast.error("❌ Please add a pickup address before listing your book.");
      navigate("/profile");
      return;
    }

    // Additional comprehensive validation
    try {
      const { validateSellerForListing } = await import(
        "@/services/checkoutValidationService"
      );
      const sellerValidation = await validateSellerForListing(user.id);

      if (!sellerValidation.isValid) {
        const errorMsg = `Cannot list books: ${sellerValidation.errors.join(", ")}`;
        toast.error(errorMsg);
        console.error("❌ Seller validation failed:", sellerValidation);

        if (!sellerValidation.hasSubaccount) {
          navigate("/profile#banking");
        } else if (!sellerValidation.hasAddress) {
          navigate("/profile#address");
        }
        return;
      }

      console.log("✅ Seller validation passed for listing");
    } catch (validationError) {
      console.error("❌ Seller validation error:", validationError);
      toast.error("Failed to validate seller information");
      return;
    }

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast.error("Please fill in all required fields and upload all photos");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookData = {
        ...formData,
        frontCover: bookImages.frontCover,
        backCover: bookImages.backCover,
        insidePages: bookImages.insidePages,
      };

      // Additional validation for images
      if (
        !bookData.frontCover ||
        !bookData.backCover ||
        !bookData.insidePages
      ) {
        throw new Error(
          "All three book photos are required. Please upload front cover, back cover, and inside pages photos.",
        );
      }

      // Validate price
      if (!bookData.price || bookData.price <= 0) {
        throw new Error("Please enter a valid price greater than R0");
      }

      const createdBook = await createBook(bookData);
      toast.success("Your book has been listed successfully!", {
        description: "Students can now find and purchase your book.",
        duration: 5000,
      });

      // Show commit reminder modal first
      setShowCommitReminderModal(true);

      // Handle first upload workflow after commit reminder
      try {
        const hasCompleted = await hasCompletedFirstUpload(user.id);
        if (!hasCompleted) {
          await markFirstUploadCompleted(user.id);
        }
      } catch (prefError) {
        // Don't fail the whole process if preference tracking fails
        console.warn("Could not track first upload preference:", prefError);
      }

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        price: 0,
        condition: "Good",
        category: "",
        grade: "",
        universityYear: "",
        university: "",
        imageUrl: "",
        frontCover: "",
        backCover: "",
        insidePages: "",
      });

      setBookImages({
        frontCover: "",
        backCover: "",
        insidePages: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Error creating listing:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create listing. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p>You need to be signed in to create a listing.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BankingRequirementGate action="create a book listing">
        <div
          className={`container mx-auto ${isMobile ? "px-2" : "px-4"} py-4 md:py-8 max-w-2xl`}
        >
          {/* Requirements Validation */}
          {!isCheckingRequirements &&
            sellerValidation &&
            !sellerValidation.canSell && (
              <SellerRestrictionBanner
                isVisible={true}
                missingRequirements={sellerValidation.missingRequirements}
                hasAddress={sellerValidation.hasAddress}
                hasBankingDetails={sellerValidation.hasBankingDetails}
              />
            )}

          {/* Loading Requirements Check */}
          {isCheckingRequirements && (
            <Alert className="mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Checking seller requirements...
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              // Check if there's history to go back to
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                // If no history, navigate to home page
                navigate("/");
              }
            }}
            className={`mb-4 md:mb-6 text-book-600 hover:text-book-700 ${isMobile ? "h-10" : ""}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isMobile ? "" : "Back"}
          </Button>

          <div
            className={`bg-white rounded-lg shadow-md ${isMobile ? "p-4" : "p-8"}`}
          >
            <h1
              className={`${isMobile ? "text-xl" : "text-3xl"} font-bold text-book-800 mb-6 text-center`}
            >
              Create New Listing
            </h1>

            <form
              onSubmit={handleSubmit}
              className={`space-y-${isMobile ? "4" : "6"}`}
            >
              <div
                className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 gap-6"}`}
              >
                <BookInformationForm
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                />

                <div className={`space-y-${isMobile ? "3" : "4"}`}>
                  <PricingSection
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                  />

                  <BookTypeSection
                    bookType={bookType}
                    formData={formData}
                    errors={errors}
                    onBookTypeChange={handleBookTypeChange}
                    onSelectChange={handleSelectChange}
                  />
                </div>
              </div>

              <div>
                <MultiImageUpload
                  currentImages={bookImages}
                  onImagesChange={(images) =>
                    setBookImages(images as typeof bookImages)
                  }
                  variant="object"
                  maxImages={3}
                />
                {(errors.frontCover ||
                  errors.backCover ||
                  errors.insidePages) && (
                  <div className="mt-2 space-y-1">
                    {errors.frontCover && (
                      <p
                        className={`${isMobile ? "text-xs" : "text-sm"} text-red-500`}
                      >
                        {errors.frontCover}
                      </p>
                    )}
                    {errors.backCover && (
                      <p
                        className={`${isMobile ? "text-xs" : "text-sm"} text-red-500`}
                      >
                        {errors.backCover}
                      </p>
                    )}
                    {errors.insidePages && (
                      <p
                        className={`${isMobile ? "text-xs" : "text-sm"} text-red-500`}
                      >
                        {errors.insidePages}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sellerPolicy"
                  checked={sellerPolicyAccepted}
                  onCheckedChange={(checked) =>
                    setSellerPolicyAccepted(checked === true)
                  }
                  className="mt-1 h-4 w-4"
                  required
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="sellerPolicy"
                    className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowSellerPolicyModal(true)}
                      className="text-book-600 hover:text-book-800 underline font-medium"
                    >
                      Seller Policy and ReBooked's platform rules
                    </button>
                  </Label>
                  {errors.sellerPolicy && (
                    <p className="text-xs text-red-500">
                      {errors.sellerPolicy}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isCheckingRequirements ||
                  canListBooks === false ||
                  !sellerPolicyAccepted
                }
                className={`w-full transition-all duration-200 font-semibold ${
                  canListBooks === false || !sellerPolicyAccepted
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-book-600 hover:bg-book-700 hover:shadow-lg active:scale-[0.98]"
                } text-white ${
                  isMobile ? "py-4 h-12 text-base" : "py-4 text-lg"
                } touch-manipulation rounded-lg`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : isCheckingRequirements ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Requirements...
                  </>
                ) : canListBooks === false ? (
                  "❌ Complete Setup Required"
                ) : !sellerPolicyAccepted ? (
                  "Accept Policy to Continue"
                ) : (
                  "📚 Create Listing"
                )}
              </Button>
            </form>
          </div>

          <FirstUploadSuccessDialog
            isOpen={showFirstUploadDialog}
            onClose={() => {
              setShowFirstUploadDialog(false);
              setShowShareProfileDialog(true);
            }}
          />

          <PostListingSuccessDialog
            isOpen={showPostListingDialog}
            onClose={() => setShowPostListingDialog(false)}
            onShareProfile={() => {
              setShowPostListingDialog(false);
              setShowShareProfileDialog(true);
            }}
          />

          <ShareProfileDialog
            isOpen={showShareProfileDialog}
            onClose={() => setShowShareProfileDialog(false)}
            userId={user?.id}
            userProfile={profile}
          />

          <SellerPolicyModal
            isOpen={showSellerPolicyModal}
            onClose={() => setShowSellerPolicyModal(false)}
          />

          <CommitReminderModal
            isOpen={showCommitReminderModal}
            onClose={() => {
              setShowCommitReminderModal(false);
              // Handle first upload workflow after commit reminder
              const handlePostCommitFlow = async () => {
                try {
                  const hasCompleted = await hasCompletedFirstUpload(user.id);
                  if (!hasCompleted) {
                    setShowFirstUploadDialog(true);
                  } else {
                    setShowPostListingDialog(true);
                  }
                } catch (prefError) {
                  console.warn(
                    "Could not track first upload preference:",
                    prefError,
                  );
                  setShowPostListingDialog(true);
                }
              };
              handlePostCommitFlow();
            }}
            type="seller"
          />
        </div>
      </BankingRequirementGate>
    </Layout>
  );
};

export default CreateListing;
