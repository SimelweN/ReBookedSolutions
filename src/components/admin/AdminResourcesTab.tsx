import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createStudyResource,
  updateStudyResource,
  deleteStudyResource,
  createStudyTip,
  updateStudyTip,
  deleteStudyTip,
  getStudyResources,
  getStudyTips,
} from "@/services/admin/studyResourcesService";
import { toast } from "sonner";
import {
  normalizeDifficulty,
  normalizeResourceType,
  normalizeTagsToArray,
  normalizeTagsToString,
  normalizeStudyTip,
  normalizeStudyResource,
} from "@/utils/typeHelpers";
import { StudyTip, StudyResource } from "@/types/university";
import {
  Lightbulb,
  BookOpen,
  Link,
  Youtube,
  File,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Star,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminResourcesTabProps {
  className?: string;
}

const AdminResourcesTab = ({ className }: AdminResourcesTabProps) => {
  const [activeTab, setActiveTab] = useState<"resources" | "tips">("resources");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    StudyResource | StudyTip | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [existingResources, setExistingResources] = useState<StudyResource[]>(
    [],
  );
  const [existingTips, setExistingTips] = useState<StudyTip[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [formData, setFormData] = useState<Partial<StudyResource & StudyTip>>({
    title: "",
    description: "",
    type: "pdf",
    category: "",
    difficulty: "Beginner",
    url: "",
    rating: 0,
    provider: "",
    duration: "",
    tags: "",
    downloadUrl: "",
    isActive: true,
    isFeatured: false,
    isSponsored: false,
    sponsorName: "",
    sponsorLogo: "",
    sponsorUrl: "",
    sponsorCta: "",
    content: "",
    author: "",
    estimatedTime: "",
    effectiveness: 0,
  });

  // Mock data for demonstration
  const mockResources: StudyResource[] = [
    {
      id: "res-1",
      title: "Advanced Mathematics Study Guide",
      description: "Comprehensive guide for calculus and linear algebra",
      type: "pdf",
      category: "Mathematics",
      difficulty: "Advanced",
      url: "https://example.com/math-guide.pdf",
      rating: 4.8,
      provider: "MathExpert",
      duration: "3 hours",
      tags: ["calculus", "linear-algebra", "mathematics"],
      isActive: true,
      isFeatured: true,
      isSponsored: false,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "res-2",
      title: "Physics Video Lectures",
      description:
        "Interactive physics lectures covering mechanics and thermodynamics",
      type: "video",
      category: "Physics",
      difficulty: "Intermediate",
      url: "https://youtube.com/physics-lectures",
      rating: 4.5,
      provider: "PhysicsWorld",
      duration: "5 hours",
      tags: ["physics", "mechanics", "thermodynamics"],
      isActive: true,
      isFeatured: false,
      isSponsored: true,
      sponsorName: "EduTech Solutions",
      sponsorLogo: "https://example.com/logo.png",
      createdAt: "2024-01-14T14:30:00Z",
      updatedAt: "2024-01-14T14:30:00Z",
    },
  ];

  const mockTips: StudyTip[] = [
    {
      id: "tip-1",
      title: "Effective Note-Taking Strategies",
      content:
        "Use the Cornell note-taking method for better retention. Divide your page into three sections: notes, cues, and summary.",
      category: "Study Skills",
      difficulty: "Beginner",
      tags: ["note-taking", "study-skills", "productivity"],
      isActive: true,
      author: "Dr. Sarah Johnson",
      estimatedTime: "15 minutes",
      effectiveness: 85,
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T09:15:00Z",
    },
    {
      id: "tip-2",
      title: "Memory Palace Technique",
      content:
        "Create mental associations by linking information to familiar locations in your mind. This ancient technique can improve recall by up to 300%.",
      category: "Memory",
      difficulty: "Intermediate",
      tags: ["memory", "mnemonics", "recall"],
      isActive: true,
      author: "Prof. Michael Chen",
      estimatedTime: "30 minutes",
      effectiveness: 92,
      isSponsored: true,
      sponsorName: "Memory Masters",
      createdAt: "2024-01-12T16:45:00Z",
      updatedAt: "2024-01-12T16:45:00Z",
    },
  ];

  useEffect(() => {
    // Load existing items when tab changes
    loadExistingItems();
  }, [activeTab]);

  const loadExistingItems = async () => {
    setIsLoadingItems(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (activeTab === "resources") {
        setExistingResources(mockResources);
      } else {
        setExistingTips(mockTips);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load existing items");
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "pdf",
      category: "",
      difficulty: "Beginner",
      url: "",
      rating: 0,
      provider: "",
      duration: "",
      tags: "",
      downloadUrl: "",
      isActive: true,
      isFeatured: false,
      isSponsored: false,
      sponsorName: "",
      sponsorLogo: "",
      sponsorUrl: "",
      sponsorCta: "",
      content: "",
      author: "",
      estimatedTime: "",
      effectiveness: 0,
    });
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  // Handle create item
  const handleCreateItem = async () => {
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsCreating(true);
    try {
      if (activeTab === "resources") {
        const normalizedResource = normalizeStudyResource({
          ...formData,
          tags: normalizeTagsToArray(formData.tags as string),
          type: formData.type as
            | "pdf"
            | "video"
            | "website"
            | "tool"
            | "course",
          difficulty: formData.difficulty as
            | "Beginner"
            | "Intermediate"
            | "Advanced",
        });

        await createStudyResource(normalizedResource);
        toast.success("Study resource created successfully!");
      } else {
        const normalizedTip = normalizeStudyTip({
          ...formData,
          tags: normalizeTagsToArray(formData.tags as string),
          difficulty: formData.difficulty as
            | "Beginner"
            | "Intermediate"
            | "Advanced",
        });

        await createStudyTip(normalizedTip);
        toast.success("Study tip created successfully!");
      }
      resetForm();
      loadExistingItems(); // Refresh the list
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit item
  const handleEditItem = (item: StudyResource | StudyTip) => {
    setSelectedItem(item);
    setIsEditing(true);

    const tagsString = normalizeTagsToString(item.tags || []);

    setFormData({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category,
      difficulty: item.difficulty,
      url: (item as StudyResource).url,
      rating: (item as StudyResource).rating,
      provider: (item as StudyResource).provider,
      duration: (item as StudyResource).duration,
      tags: tagsString,
      downloadUrl: (item as StudyResource).downloadUrl,
      isActive: item.isActive,
      isFeatured: (item as StudyResource).isFeatured,
      isSponsored: item.isSponsored,
      sponsorName: item.sponsorName,
      sponsorLogo: item.sponsorLogo,
      sponsorUrl: item.sponsorUrl,
      sponsorCta: item.sponsorCta,
      content: (item as StudyTip).content,
      author: (item as StudyTip).author,
      estimatedTime: (item as StudyTip).estimatedTime,
      effectiveness: (item as StudyTip).effectiveness,
    });
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!selectedItem?.id || !formData.title?.trim()) {
      toast.error("Invalid item data");
      return;
    }

    setIsCreating(true);
    try {
      if (activeTab === "resources") {
        const normalizedResource = normalizeStudyResource({
          ...formData,
          id: selectedItem.id,
          tags: normalizeTagsToArray(formData.tags as string),
          type: formData.type as
            | "pdf"
            | "video"
            | "website"
            | "tool"
            | "course",
          difficulty: formData.difficulty as
            | "Beginner"
            | "Intermediate"
            | "Advanced",
        });

        await updateStudyResource(selectedItem.id, normalizedResource);
        toast.success("Study resource updated successfully!");
      } else {
        const normalizedTip = normalizeStudyTip({
          ...formData,
          id: selectedItem.id,
          tags: normalizeTagsToArray(formData.tags as string),
          difficulty: formData.difficulty as
            | "Beginner"
            | "Intermediate"
            | "Advanced",
        });

        await updateStudyTip(selectedItem.id, normalizedTip);
        toast.success("Study tip updated successfully!");
      }
      resetForm();
      setIsEditing(false);
      setSelectedItem(null);
      loadExistingItems(); // Refresh the list
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    try {
      if (activeTab === "resources") {
        await deleteStudyResource(id);
        setExistingResources((prev) => prev.filter((item) => item.id !== id));
        toast.success("Study resource deleted successfully!");
      } else {
        await deleteStudyTip(id);
        setExistingTips((prev) => prev.filter((item) => item.id !== id));
        toast.success("Study tip deleted successfully!");
      }
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedItem(null);
    resetForm();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Youtube className="h-4 w-4" />;
      case "website":
        return <Link className="h-4 w-4" />;
      case "pdf":
        return <File className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab Switching */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Study Resources Management
          </h2>
          <p className="text-gray-600">
            Create and manage study resources and tips for students
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === "resources" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("resources")}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Resources ({existingResources.length})
          </Button>
          <Button
            variant={activeTab === "tips" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tips")}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Tips ({existingTips.length})
          </Button>
        </div>
      </div>

      {/* Creation/Edit Form */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-book-300 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? "Edit Item" : "Create New"}{" "}
            {activeTab === "resources" ? "Resource" : "Tip"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the details of the selected item."
              : `Add a new study ${activeTab === "resources" ? "resource" : "tip"} to the platform.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter title"
                value={formData.title || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., Mathematics, Physics"
                value={formData.category || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty || "Beginner"}
                onValueChange={(value) =>
                  handleSelectChange("difficulty", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab === "resources" && (
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type || "pdf"}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "tips" && (
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  name="estimatedTime"
                  placeholder="e.g., 15 minutes"
                  value={formData.estimatedTime || ""}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {activeTab === "resources" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  value={formData.url || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  name="provider"
                  placeholder="Content provider name"
                  value={formData.provider || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="mathematics, calculus, study-guide"
              value={formData.tags || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {activeTab === "tips" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter the study tip content..."
                value={formData.content || ""}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) =>
                  handleSwitchChange("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {activeTab === "resources" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isFeatured", checked)
                  }
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isSponsored"
                checked={formData.isSponsored || false}
                onCheckedChange={(checked) =>
                  handleSwitchChange("isSponsored", checked)
                }
              />
              <Label htmlFor="isSponsored">Sponsored</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isCreating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateItem} disabled={isCreating}>
                  <Save className="mr-2 h-4 w-4" />
                  {isCreating ? "Updating..." : "Update Item"}
                </Button>
              </>
            ) : (
              <Button onClick={handleCreateItem} disabled={isCreating}>
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? "Creating..." : "Create Item"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === "resources" ? (
              <BookOpen className="h-5 w-5" />
            ) : (
              <Lightbulb className="h-5 w-5" />
            )}
            Existing {activeTab === "resources" ? "Resources" : "Tips"}
          </CardTitle>
          <CardDescription>
            Manage and edit existing study{" "}
            {activeTab === "resources" ? "resources" : "tips"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text={`Loading ${activeTab}...`} />
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "resources" ? (
                existingResources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No resources found. Create your first resource above.
                  </div>
                ) : (
                  existingResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(resource.type)}
                              <h3 className="font-semibold text-lg">
                                {resource.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getDifficultyColor(
                                  resource.difficulty,
                                )}
                              >
                                {resource.difficulty}
                              </Badge>
                              {resource.isFeatured && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {resource.isSponsored && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  Sponsored
                                </Badge>
                              )}
                              {!resource.isActive && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{resource.provider}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{resource.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>{resource.rating}/5</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.tags?.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(resource);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : existingTips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tips found. Create your first tip above.
                </div>
              ) : (
                existingTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{tip.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getDifficultyColor(tip.difficulty)}
                            >
                              {tip.difficulty}
                            </Badge>
                            {tip.isSponsored && (
                              <Badge className="bg-purple-100 text-purple-800">
                                Sponsored
                              </Badge>
                            )}
                            {!tip.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-3">
                          {tip.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{tip.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{tip.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{tip.effectiveness}% effective</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tip.tags?.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(tip)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(tip);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {activeTab === "resources" ? "Resource" : "Tip"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedItem?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResourcesTab;
