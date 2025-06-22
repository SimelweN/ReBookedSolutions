import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorUtils";
import { StudyTip, StudyResource } from "@/types/university";

interface StudyResourcePayload {
  title: string;
  description: string;
  type: "pdf" | "video" | "website" | "tool" | "course";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  tags: string[];
  url?: string;
  provider?: string;
  duration?: string;
  rating?: number;
  downloadUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorLogo?: string;
  sponsorUrl?: string;
  sponsorCta?: string;
}

interface StudyTipPayload {
  title: string;
  content: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  isActive: boolean;
  author?: string;
  estimatedTime?: string;
  effectiveness?: number;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorLogo?: string;
  sponsorUrl?: string;
  sponsorCta?: string;
}

// Create study resource in database
export const createStudyResource = async (
  data: StudyResourcePayload,
): Promise<StudyResource> => {
  try {
    console.log("Creating study resource:", data);

    // Check if table exists first
    const tableExists = await checkTableExists("study_resources");
    if (!tableExists) {
      const errorMessage =
        "Study resources database table is not available. Please contact your administrator to run the required database migrations.";
      console.error("Database migration required:", errorMessage);
      throw new Error(errorMessage);
    }

    const resourceData = {
      title: data.title,
      description: data.description,
      type: data.type,
      difficulty: data.difficulty,
      category: data.category,
      tags: data.tags,
      url: data.url,
      provider: data.provider,
      duration: data.duration,
      rating: data.rating || 0,
      download_url: data.downloadUrl,
      is_active: data.isActive,
      is_featured: data.isFeatured || false,
      is_sponsored: data.isSponsored || false,
      sponsor_name: data.sponsorName,
      sponsor_logo: data.sponsorLogo,
      sponsor_url: data.sponsorUrl,
      sponsor_cta: data.sponsorCta,
    };

    const { data: result, error } = await supabase
      .from("study_resources")
      .insert([resourceData])
      .select()
      .single();

    if (error) {
      logError("studyResourcesService.createStudyResource", error);

      if (error.code === "42P01") {
        throw new Error(
          "Study resources table not found. Database migration needed.",
        );
      }

      throw new Error("Failed to create study resource");
    }

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type,
      category: result.category,
      difficulty: result.difficulty,
      url: result.url,
      rating: result.rating,
      provider: "", // Provider column doesn't exist
      duration: result.duration,
      tags: result.tags || [],
      downloadUrl: result.download_url,
      isActive: result.is_active,
      isFeatured: result.is_featured,
      isSponsored: result.is_sponsored,
      sponsorName: result.sponsor_name,
      sponsorLogo: result.sponsor_logo,
      sponsorUrl: result.sponsor_url,
      sponsorCta: result.sponsor_cta,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    logError("studyResourcesService.createStudyResource", error);
    throw error;
  }
};

// Update study resource
export const updateStudyResource = async (
  id: string,
  data: Partial<StudyResourcePayload>,
): Promise<StudyResource> => {
  try {
    console.log(`Updating study resource ${id}:`, data);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.downloadUrl !== undefined)
      updateData.download_url = data.downloadUrl;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;
    if (data.isSponsored !== undefined)
      updateData.is_sponsored = data.isSponsored;
    if (data.sponsorName !== undefined)
      updateData.sponsor_name = data.sponsorName;
    if (data.sponsorLogo !== undefined)
      updateData.sponsor_logo = data.sponsorLogo;
    if (data.sponsorUrl !== undefined) updateData.sponsor_url = data.sponsorUrl;
    if (data.sponsorCta !== undefined) updateData.sponsor_cta = data.sponsorCta;

    const { data: result, error } = await supabase
      .from("study_resources")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logError("studyResourcesService.updateStudyResource", error);
      throw new Error("Failed to update study resource");
    }

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type,
      category: result.category,
      difficulty: result.difficulty,
      url: result.url,
      rating: result.rating,
      provider: result.provider,
      duration: result.duration,
      tags: result.tags || [],
      downloadUrl: result.download_url,
      isActive: result.is_active,
      isFeatured: result.is_featured,
      isSponsored: result.is_sponsored,
      sponsorName: result.sponsor_name,
      sponsorLogo: result.sponsor_logo,
      sponsorUrl: result.sponsor_url,
      sponsorCta: result.sponsor_cta,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    logError("studyResourcesService.updateStudyResource", error);
    throw error;
  }
};

// Delete study resource
export const deleteStudyResource = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting study resource ${id}`);

    const { error } = await supabase
      .from("study_resources")
      .delete()
      .eq("id", id);

    if (error) {
      logError("studyResourcesService.deleteStudyResource", error);
      throw new Error("Failed to delete study resource");
    }
  } catch (error) {
    logError("studyResourcesService.deleteStudyResource", error);
    throw error;
  }
};

// Create study tip in database
export const createStudyTip = async (
  data: StudyTipPayload,
): Promise<StudyTip> => {
  try {
    console.log("Creating study tip:", data);

    // Check if table exists first
    const tableExists = await checkTableExists("study_tips");
    if (!tableExists) {
      const errorMessage =
        "Study tips database table is not available. Please contact your administrator to run the required database migrations.";
      console.error("Database migration required:", errorMessage);
      throw new Error(errorMessage);
    }

    const tipData = {
      title: data.title,
      content: data.content,
      category: data.category,
      difficulty: data.difficulty,
      tags: data.tags,
      is_active: data.isActive,
      author: data.author,
      estimated_time: data.estimatedTime,
      effectiveness: data.effectiveness,
      is_sponsored: data.isSponsored || false,
      sponsor_name: data.sponsorName,
      sponsor_logo: data.sponsorLogo,
      sponsor_url: data.sponsorUrl,
      sponsor_cta: data.sponsorCta,
    };

    const { data: result, error } = await supabase
      .from("study_tips")
      .insert([tipData])
      .select()
      .single();

    if (error) {
      logError("studyResourcesService.createStudyTip", error);

      if (error.code === "42P01") {
        throw new Error(
          "Study tips table not found. Database migration needed.",
        );
      }

      throw new Error("Failed to create study tip");
    }

    return {
      id: result.id,
      title: result.title,
      content: "", // Content column doesn't exist
      category: result.category,
      difficulty: result.difficulty,
      tags: result.tags || [],
      isActive: result.is_active,
      author: result.author,
      estimatedTime: result.estimated_time,
      effectiveness: result.effectiveness,
      isSponsored: result.is_sponsored,
      sponsorName: result.sponsor_name,
      sponsorLogo: result.sponsor_logo,
      sponsorUrl: result.sponsor_url,
      sponsorCta: result.sponsor_cta,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    logError("studyResourcesService.createStudyTip", error);
    throw error;
  }
};

// Update study tip
export const updateStudyTip = async (
  id: string,
  data: Partial<StudyTipPayload>,
): Promise<StudyTip> => {
  try {
    console.log(`Updating study tip ${id}:`, data);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.estimatedTime !== undefined)
      updateData.estimated_time = data.estimatedTime;
    if (data.effectiveness !== undefined)
      updateData.effectiveness = data.effectiveness;
    if (data.isSponsored !== undefined)
      updateData.is_sponsored = data.isSponsored;
    if (data.sponsorName !== undefined)
      updateData.sponsor_name = data.sponsorName;
    if (data.sponsorLogo !== undefined)
      updateData.sponsor_logo = data.sponsorLogo;
    if (data.sponsorUrl !== undefined) updateData.sponsor_url = data.sponsorUrl;
    if (data.sponsorCta !== undefined) updateData.sponsor_cta = data.sponsorCta;

    const { data: result, error } = await supabase
      .from("study_tips")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logError("studyResourcesService.updateStudyTip", error);
      throw new Error("Failed to update study tip");
    }

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      category: result.category,
      difficulty: result.difficulty,
      tags: result.tags || [],
      isActive: result.is_active,
      author: result.author,
      estimatedTime: result.estimated_time,
      effectiveness: result.effectiveness,
      isSponsored: result.is_sponsored,
      sponsorName: result.sponsor_name,
      sponsorLogo: result.sponsor_logo,
      sponsorUrl: result.sponsor_url,
      sponsorCta: result.sponsor_cta,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    logError("studyResourcesService.updateStudyTip", error);
    throw error;
  }
};

// Delete study tip
export const deleteStudyTip = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting study tip ${id}`);

    const { error } = await supabase.from("study_tips").delete().eq("id", id);

    if (error) {
      logError("studyResourcesService.deleteStudyTip", error);
      throw new Error("Failed to delete study tip");
    }
  } catch (error) {
    logError("studyResourcesService.deleteStudyTip", error);
    throw error;
  }
};

// Check if study resources table exists
const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1);

    return !error || error.code !== "42P01";
  } catch (error) {
    return false;
  }
};

// Get all study resources
export const getStudyResources = async (): Promise<StudyResource[]> => {
  try {
    console.log("Fetching study resources...");

    // Check if table exists first
    const tableExists = await checkTableExists("study_resources");
    if (!tableExists) {
      console.warn(
        "Study resources table does not exist. Creating a sample entry to initialize.",
      );
      // Return empty array but don't fail
      return [];
    }

    // Query only columns that exist in the actual table
    const { data, error } = await supabase
      .from("study_resources")
      .select(
        `
        id,
        title,
        description,
        type,
        category,
        difficulty,
        url,
        rating,
        tags,
        sponsored,
        created_at,
        updated_at
      `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("studyResourcesService.getStudyResources error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Handle specific database errors
      if (error.code === "42P01") {
        console.warn(
          "Study resources table not found. Database migration may be needed.",
        );
        return [];
      }

      if (error.code === "42703") {
        console.error(
          "Column not found in study_resources table. Check table schema:",
          error.message,
        );
        return [];
      }

      throw new Error(`Failed to fetch study resources: ${error.message}`);
    }

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category,
      difficulty: item.difficulty,
      url: item.url,
      rating: item.rating,
      provider: "", // Provider column doesn't exist in table
      duration: item.duration,
      tags: item.tags || [],
      downloadUrl: item.download_url,
      isActive: item.is_active,
      isFeatured: item.is_featured,
      isSponsored: item.is_sponsored,
      sponsorName: item.sponsor_name,
      sponsorLogo: item.sponsor_logo,
      sponsorUrl: item.sponsor_url,
      sponsorCta: item.sponsor_cta,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    logError("studyResourcesService.getStudyResources", error);
    return []; // Return empty array on error
  }
};

// Get all study tips
export const getStudyTips = async (): Promise<StudyTip[]> => {
  try {
    console.log("Fetching study tips...");

    // Check if table exists first
    const tableExists = await checkTableExists("study_tips");
    if (!tableExists) {
      console.warn(
        "Study tips table does not exist. Creating a sample entry to initialize.",
      );
      // Return empty array but don't fail
      return [];
    }

    // Query only columns that exist in the actual table
    const { data, error } = await supabase
      .from("study_tips")
      .select(
        `
        id,
        title,
        description,
        is_active,
        created_at,
        updated_at
      `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("studyResourcesService.getStudyTips error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      if (error.code === "42P01") {
        console.warn(
          "Study tips table not found. Database migration may be needed.",
        );
        return [];
      }

      if (error.code === "42703") {
        console.error(
          "Column not found in study_tips table. Check table schema:",
          error.message,
        );
        return [];
      }

      throw new Error(`Failed to fetch study tips: ${error.message}`);
    }

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      content: "", // Content column doesn't exist in table
      category: item.category,
      difficulty: item.difficulty,
      tags: item.tags || [],
      isActive: item.is_active,
      author: item.author,
      estimatedTime: item.estimated_time,
      effectiveness: item.effectiveness,
      isSponsored: item.is_sponsored,
      sponsorName: item.sponsor_name,
      sponsorLogo: item.sponsor_logo,
      sponsorUrl: item.sponsor_url,
      sponsorCta: item.sponsor_cta,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    logError("studyResourcesService.getStudyTips", error);
    return []; // Return empty array on error
  }
};

// Legacy service object for backwards compatibility
export const studyResourcesService = {
  getStudyResources,
  createStudyResource,
  updateStudyResource,
  deleteStudyResource,
  getStudyTips,
  createStudyTip,
  updateStudyTip,
  deleteStudyTip,
  getAllStudyContent: async () => {
    const [tips, resources] = await Promise.all([
      getStudyTips(),
      getStudyResources(),
    ]);
    return { tips, resources };
  },
};

// Get all study content (tips and resources)
export const getAllStudyContent = async (): Promise<{
  tips: StudyTip[];
  resources: StudyResource[];
}> => {
  try {
    console.log("Fetching all study content...");

    const [tips, resources] = await Promise.all([
      getStudyTips(),
      getStudyResources(),
    ]);

    return { tips, resources };
  } catch (error) {
    logError("studyResourcesService.getAllStudyContent", error);
    return { tips: [], resources: [] };
  }
};
