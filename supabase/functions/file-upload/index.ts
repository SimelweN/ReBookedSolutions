import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

// Validate environment on startup
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);

// File type configurations
const FILE_CONFIGS = {
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    folder: "images",
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    folder: "documents",
  },
  profile_pictures: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    folder: "profiles",
  },
  book_images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    folder: "books",
  },
  study_resources: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ],
    folder: "study-resources",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "POST":
        if (action === "upload") {
          return await handleFileUpload(supabase, req, user.id);
        } else if (action === "upload-multiple") {
          return await handleMultipleFileUpload(supabase, req, user.id);
        } else if (action === "process-image") {
          return await processImage(supabase, req, user.id);
        }
        break;

      case "DELETE":
        if (action === "delete") {
          const { filePath } = await req.json();
          return await deleteFile(supabase, filePath, user.id);
        }
        break;

      case "GET":
        if (action === "signed-url") {
          const filePath = url.searchParams.get("path");
          const expiresIn = parseInt(url.searchParams.get("expires") || "3600");
          return await getSignedUrl(supabase, filePath!, expiresIn);
        } else if (action === "user-files") {
          const folder = url.searchParams.get("folder");
          return await getUserFiles(supabase, user.id, folder);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleFileUpload(supabase: any, req: Request, userId: string) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileType = (formData.get("type") as string) || "images";
  const folder = formData.get("folder") as string;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate file
  const validation = validateFile(file, fileType);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const config = FILE_CONFIGS[fileType as keyof typeof FILE_CONFIGS];
  const filePath = `${folder || config.folder}/${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(filePath);

  // Log file upload
  await supabase.from("file_uploads").insert({
    user_id: userId,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    public_url: publicUrl,
    folder: fileType,
  });

  return new Response(
    JSON.stringify({
      success: true,
      file: {
        path: filePath,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function handleMultipleFileUpload(
  supabase: any,
  req: Request,
  userId: string,
) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const fileType = (formData.get("type") as string) || "images";
  const folder = formData.get("folder") as string;

  if (!files.length) {
    return new Response(JSON.stringify({ error: "No files provided" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      // Validate each file
      const validation = validateFile(file, fileType);
      if (!validation.valid) {
        errors.push({ file: file.name, error: validation.error });
        continue;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const config = FILE_CONFIGS[fileType as keyof typeof FILE_CONFIGS];
      const filePath = `${folder || config.folder}/${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("files")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        errors.push({ file: file.name, error: error.message });
        continue;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("files").getPublicUrl(filePath);

      // Log file upload
      await supabase.from("file_uploads").insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        public_url: publicUrl,
        folder: fileType,
      });

      results.push({
        path: filePath,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      files: results,
      errors: errors.length > 0 ? errors : undefined,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function processImage(supabase: any, req: Request, userId: string) {
  const { filePath, operations } = await req.json();

  // Download original image
  const { data: imageData, error: downloadError } = await supabase.storage
    .from("files")
    .download(filePath);

  if (downloadError) {
    throw downloadError;
  }

  // Process image based on operations
  let processedImage = await imageData.arrayBuffer();

  // Apply operations (resize, crop, optimize, etc.)
  for (const operation of operations) {
    switch (operation.type) {
      case "resize":
        processedImage = await resizeImage(
          processedImage,
          operation.width,
          operation.height,
        );
        break;
      case "crop":
        processedImage = await cropImage(
          processedImage,
          operation.x,
          operation.y,
          operation.width,
          operation.height,
        );
        break;
      case "optimize":
        processedImage = await optimizeImage(
          processedImage,
          operation.quality || 85,
        );
        break;
    }
  }

  // Generate new filename for processed image
  const originalName = filePath.split("/").pop();
  const nameWithoutExt = originalName!.split(".")[0];
  const ext = originalName!.split(".").pop();
  const processedPath = filePath.replace(
    originalName!,
    `${nameWithoutExt}_processed.${ext}`,
  );

  // Upload processed image
  const { data, error } = await supabase.storage
    .from("files")
    .upload(processedPath, processedImage, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(processedPath);

  return new Response(
    JSON.stringify({
      success: true,
      processedFile: {
        path: processedPath,
        url: publicUrl,
      },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function deleteFile(supabase: any, filePath: string, userId: string) {
  // Verify user owns the file
  const { data: fileRecord } = await supabase
    .from("file_uploads")
    .select("user_id")
    .eq("file_path", filePath)
    .single();

  if (fileRecord?.user_id !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("files")
    .remove([filePath]);

  if (storageError) {
    throw storageError;
  }

  // Delete from database
  await supabase.from("file_uploads").delete().eq("file_path", filePath);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getSignedUrl(
  supabase: any,
  filePath: string,
  expiresIn: number,
) {
  const { data, error } = await supabase.storage
    .from("files")
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUserFiles(supabase: any, userId: string, folder?: string) {
  let query = supabase
    .from("file_uploads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (folder) {
    query = query.eq("folder", folder);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ files: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateFile(
  file: File,
  fileType: string,
): { valid: boolean; error?: string } {
  const config = FILE_CONFIGS[fileType as keyof typeof FILE_CONFIGS];

  if (!config) {
    return { valid: false, error: "Invalid file type configuration" };
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  return { valid: true };
}

// Image processing utilities (simplified - in production use proper image processing library)
async function resizeImage(
  imageBuffer: ArrayBuffer,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  // Implementation would use image processing library like sharp or similar
  return imageBuffer; // Placeholder
}

async function cropImage(
  imageBuffer: ArrayBuffer,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  // Implementation would use image processing library
  return imageBuffer; // Placeholder
}

async function optimizeImage(
  imageBuffer: ArrayBuffer,
  quality: number,
): Promise<ArrayBuffer> {
  // Implementation would use image processing library
  return imageBuffer; // Placeholder
}
