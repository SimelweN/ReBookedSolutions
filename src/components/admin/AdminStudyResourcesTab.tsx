
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FileText, BookOpen, User } from "lucide-react";
import { toast } from "sonner";
import { studyResourcesService } from "@/services/admin/studyResourcesService"; // Corrected import

interface StudyResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'tip';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  content: string;
  author: string;
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface StudyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// Define specific types for form data to ensure proper type checking
type ResourceFormType = 'guide' | 'template' | 'tip';
type ResourceFormDifficulty = 'beginner' | 'intermediate' | 'advanced';
type TipFormDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface ResourceFormData {
  title: string;
  description: string;
  type: ResourceFormType;
  difficulty: ResourceFormDifficulty;
  category: string;
  tags: string; // Kept as string for input, converted on submit
  content: string;
  author: string;
  featured: boolean;
}

interface TipFormData {
  title: string;
  content: string;
  category: string;
  difficulty: TipFormDifficulty;
  tags: string; // Kept as string for input, converted on submit
  featured: boolean;
  author: string;
}


const AdminStudyResourcesTab = () => {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [tips, setTips] = useState<StudyTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showTipForm, setShowTipForm] = useState(false);
  const [editingResource, setEditingResource] = useState<StudyResource | null>(null);
  const [editingTip, setEditingTip] = useState<StudyTip | null>(null);

  const initialResourceFormState: ResourceFormData = {
    title: '',
    description: '',
    type: 'guide',
    difficulty: 'beginner',
    category: '',
    tags: '',
    content: '',
    author: '',
    featured: false,
  };

  const initialTipFormState: TipFormData = {
    title: '',
    content: '',
    category: '',
    difficulty: 'beginner',
    tags: '',
    featured: false,
    author: '',
  };

  const [resourceForm, setResourceForm] = useState<ResourceFormData>(initialResourceFormState);
  const [tipForm, setTipForm] = useState<TipFormData>(initialTipFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resourcesData, tipsData] = await Promise.all([
        studyResourcesService.getStudyResources(),
        studyResourcesService.getStudyTips(),
      ]);
      setResources(resourcesData as StudyResource[]); // Cast if service returns 'any'
      setTips(tipsData as StudyTip[]); // Cast if service returns 'any'
    } catch (error) {
      console.error('Error loading study resources:', error);
      setError('Failed to load study resources');
      toast.error('Failed to load study resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resourcePayload = {
        ...resourceForm,
        tags: resourceForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingResource) {
        await studyResourcesService.updateStudyResource(editingResource.id, resourcePayload);
        toast.success('Resource updated successfully');
      } else {
        await studyResourcesService.createStudyResource(resourcePayload);
        toast.success('Resource created successfully');
      }

      resetResourceForm();
      loadData();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const handleTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tipPayload = {
        ...tipForm,
        tags: tipForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingTip) {
        await studyResourcesService.updateStudyTip(editingTip.id, tipPayload);
        toast.success('Tip updated successfully');
      } else {
        await studyResourcesService.createStudyTip(tipPayload);
        toast.success('Tip created successfully');
      }

      resetTipForm();
      loadData();
    } catch (error) {
      console.error('Error saving tip:', error);
      toast.error('Failed to save tip');
    }
  };

  const resetResourceForm = () => {
    setResourceForm(initialResourceFormState);
    setEditingResource(null);
    setShowResourceForm(false);
  };

  const resetTipForm = () => {
    setTipForm(initialTipFormState);
    setEditingTip(null);
    setShowTipForm(false);
  };

  const editResource = (resource: StudyResource) => {
    setResourceForm({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      difficulty: resource.difficulty,
      category: resource.category,
      tags: resource.tags.join(', '), // This line had error TS2322, should be fine with ResourceFormData.tags as string
      content: resource.content,
      author: resource.author,
      featured: resource.featured,
    });
    setEditingResource(resource);
    setShowResourceForm(true);
  };

  const editTip = (tip: StudyTip) => {
    setTipForm({
      title: tip.title,
      content: tip.content,
      category: tip.category,
      difficulty: tip.difficulty,
      tags: tip.tags.join(', '),
      featured: tip.featured,
      author: tip.author,
    });
    setEditingTip(tip);
    setShowTipForm(true);
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await studyResourcesService.deleteStudyResource(id);
      toast.success('Resource deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const deleteTip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;
    
    try {
      await studyResourcesService.deleteStudyTip(id);
      toast.success('Tip deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting tip:', error);
      toast.error('Failed to delete tip');
    }
  };

  if (isLoading) {
    return <div>Loading study resources...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Resources Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => { setShowResourceForm(true); setEditingResource(null); setResourceForm(initialResourceFormState); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
          <Button onClick={() => { setShowTipForm(true); setEditingTip(null); setTipForm(initialTipFormState); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tip
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resources">Study Resources ({resources.length})</TabsTrigger>
          <TabsTrigger value="tips">Study Tips ({tips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {showResourceForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingResource ? 'Edit Resource' : 'Create New Resource'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResourceSubmit} className="space-y-4">
                  {/* ... form fields ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resource-title">Title</Label>
                      <Input
                        id="resource-title"
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="resource-author">Author</Label>
                      <Input
                        id="resource-author"
                        value={resourceForm.author}
                        onChange={(e) => setResourceForm(prev => ({ ...prev, author: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="resource-description">Description</Label>
                    <Textarea
                      id="resource-description"
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="resource-type">Type</Label>
                      <Select
                        value={resourceForm.type}
                        onValueChange={(value: ResourceFormType) => // Use specific form type
                          setResourceForm(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="tip">Tip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resource-difficulty">Difficulty</Label>
                      <Select
                        value={resourceForm.difficulty}
                        onValueChange={(value: ResourceFormDifficulty) => // Use specific form type
                          setResourceForm(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resource-category">Category</Label>
                      <Input
                        id="resource-category"
                        value={resourceForm.category}
                        onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="resource-tags">Tags (comma separated)</Label>
                    <Input
                      id="resource-tags"
                      value={resourceForm.tags}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="study tips, university, guide"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resource-content">Content</Label>
                    <Textarea
                      id="resource-content"
                      value={resourceForm.content}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="resource-featured"
                      checked={resourceForm.featured}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, featured: e.target.checked }))}
                    />
                    <Label htmlFor="resource-featured">Featured Resource</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingResource ? 'Update Resource' : 'Create Resource'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetResourceForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <h3 className="font-semibold">{resource.title}</h3>
                        {resource.featured && (
                          <Badge variant="default">
                            <span className="text-xs">Featured</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">
                          <span className="text-xs">{resource.type}</span>
                        </Badge>
                        <Badge variant="outline">
                          <span className="text-xs">{resource.difficulty}</span>
                        </Badge>
                        <Badge variant="outline">
                          <span className="text-xs">{resource.category}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {resource.author}
                        </span>
                        <span>{resource.views} views</span>
                        <span>{resource.likes} likes</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editResource(resource)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          {showTipForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTip ? 'Edit Study Tip' : 'Create New Study Tip'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTipSubmit} className="space-y-4">
                 {/* ... form fields ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tip-title">Title</Label>
                      <Input
                        id="tip-title"
                        value={tipForm.title}
                        onChange={(e) => setTipForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tip-author">Author</Label>
                      <Input
                        id="tip-author"
                        value={tipForm.author}
                        onChange={(e) => setTipForm(prev => ({ ...prev, author: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tip-content">Content</Label>
                    <Textarea
                      id="tip-content"
                      value={tipForm.content}
                      onChange={(e) => setTipForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tip-difficulty">Difficulty</Label>
                      <Select
                        value={tipForm.difficulty}
                        onValueChange={(value: TipFormDifficulty) => // Use specific form type
                          setTipForm(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tip-category">Category</Label>
                      <Input
                        id="tip-category"
                        value={tipForm.category}
                        onChange={(e) => setTipForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tip-tags">Tags (comma separated)</Label>
                    <Input
                      id="tip-tags"
                      value={tipForm.tags}
                      onChange={(e) => setTipForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="productivity, time management, study methods"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tip-featured"
                      checked={tipForm.featured}
                      onChange={(e) => setTipForm(prev => ({ ...prev, featured: e.target.checked }))}
                    />
                    <Label htmlFor="tip-featured">Featured Tip</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingTip ? 'Update Tip' : 'Create Tip'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetTipForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {tips.map((tip) => (
              <Card key={tip.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <h3 className="font-semibold">{tip.title}</h3>
                        {tip.featured && (
                          <Badge variant="default">
                            <span className="text-xs">Featured</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-3">{tip.content}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">
                          <span className="text-xs">{tip.difficulty}</span>
                        </Badge>
                        <Badge variant="outline">
                          <span className="text-xs">{tip.category}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tip.author}
                        </span>
                        <span>{tip.views} views</span>
                        <span>{tip.likes} likes</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editTip(tip)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteTip(tip.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStudyResourcesTab;

