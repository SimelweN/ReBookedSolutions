import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createBook } from "@/services/book/bookMutations";
import { BookFormData } from "@/types/book";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import MultiImageUpload from "@/components/MultiImageUpload";
import FirstUploadSuccessDialog from "@/components/FirstUploadSuccessDialog";
import PostListingSuccessDialog from "@/components/PostListingSuccessDialog";
import ShareProfileDialog from "@/components/ShareProfileDialog";
import {
  hasCompletedFirstUpload,
  markFirstUploadCompleted,
} from "@/services/userPreferenceService";
import { BookInformationForm } from "@/components/create-listing/BookInformationForm";
import { PricingSection } from "@/components/create-listing/PricingSection";
import { BookTypeSection } from "@/components/create-listing/BookTypeSection";
import { useIsMobile } from "@/hooks/use-mobile";

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

    if (bookType === "university" && !formData.universityYear) {
      newErrors.universityYear =
        "University year is required for university books";
    }

    if (!bookImages.frontCover)
      newErrors.frontCover = "Front cover photo is required";
    if (!bookImages.backCover)
      newErrors.backCover = "Back cover photo is required";
    if (!bookImages.insidePages)
      newErrors.insidePages = "Inside pages photo is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast.error("Please fill in all required fields and upload all photos");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a listing");
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

      // Handle first upload workflow
      try {
        const hasCompleted = await hasCompletedFirstUpload(user.id);
        if (!hasCompleted) {
          await markFirstUploadCompleted(user.id);
          setShowFirstUploadDialog(true);
        } else {
          setShowPostListingDialog(true);
        }
      } catch (prefError) {
        // Don't fail the whole process if preference tracking fails
        console.warn("Could not track first upload preference:", prefError);
        setShowPostListingDialog(true);
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
      <div
        className={`container mx-auto ${isMobile ? "px-2" : "px-4"} py-4 md:py-8 max-w-2xl`}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-book-600 hover:bg-book-700 text-white ${isMobile ? "py-3 h-12 text-base" : "py-3 text-lg"} touch-manipulation`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                "Create Listing"
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
      </div>
    </Layout>
  );
};

export default CreateListing;
