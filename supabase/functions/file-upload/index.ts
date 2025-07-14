import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["POST", "OPTIONS"];

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      return errorResponse("Invalid form data", 400, "INVALID_FORM_DATA", {
        error: error.message,
      });
    }

    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "book-images";
    const userId = formData.get("userId") as string;
    const folder = (formData.get("folder") as string) || "";

    // Validate required fields
    if (!file) {
      return errorResponse("No file provided", 400, "FILE_MISSING");
    }

    if (!userId) {
      return errorResponse("User ID is required", 400, "USER_ID_MISSING");
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`,
        400,
        "INVALID_FILE_TYPE",
        { fileType: file.type, allowedTypes },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse(
        `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
        400,
        "FILE_TOO_LARGE",
        { fileSize: file.size, maxSize },
      );
    }

    // Generate secure filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 50);

    const folderPath = folder ? `${folder}/` : "";
    const fileName = `${folderPath}${userId}/${timestamp}-${randomString}-${sanitizedOriginalName}`;

    // Convert file to buffer
    let fileBuffer: ArrayBuffer;
    try {
      fileBuffer = await file.arrayBuffer();
    } catch (error) {
      return errorResponse("Failed to read file data", 400, "FILE_READ_ERROR", {
        error: error.message,
      });
    }

    // Upload to Supabase Storage with timeout
    const uploadOperation = async () => {
      return await supabase.storage.from(bucket).upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    };

    const { data: uploadData, error: uploadError } = await withTimeout(
      uploadOperation(),
      30000, // 30 second timeout
      "File upload timed out",
    );

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return errorResponse(
        "Failed to upload file to storage",
        500,
        "STORAGE_UPLOAD_ERROR",
        {
          error: uploadError.message,
          bucket,
          fileName: fileName.substring(0, 100), // Truncate for logging
        },
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return errorResponse(
        "Failed to generate public URL",
        500,
        "PUBLIC_URL_ERROR",
      );
    }

    // Log the upload (non-blocking)
    const auditLog = {
      action: "file_uploaded",
      table_name: "storage",
      user_id: userId,
      new_values: {
        bucket,
        fileName: uploadData.path,
        originalName: file.name,
        fileSize: file.size,
        contentType: file.type,
        publicUrl: publicUrlData.publicUrl,
      },
    };

    // Don't wait for audit log to complete
    supabase
      .from("audit_logs")
      .insert(auditLog)
      .catch((error) => {
        console.warn("Failed to log file upload:", error.message);
      });

    return successResponse(
      {
        fileName: uploadData.path,
        publicUrl: publicUrlData.publicUrl,
        fileSize: file.size,
        contentType: file.type,
        originalName: file.name,
        bucket,
      },
      "File uploaded successfully",
    );
  } catch (error) {
    console.error("Unexpected error in file-upload:", error);
    return errorResponse(
      "An unexpected error occurred during file upload",
      500,
      "UNEXPECTED_ERROR",
      { error: error.message },
    );
  }
};

// Health check endpoint for GET requests
const healthHandler = async (req: Request): Promise<Response> => {
  if (req.method === "GET") {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Test storage access
    let storageHealthy = false;
    try {
      const { data, error } = await supabase.storage.listBuckets();
      storageHealthy = !error && Array.isArray(data);
    } catch {
      storageHealthy = false;
    }

    return successResponse({
      service: "file-upload",
      timestamp: new Date().toISOString(),
      storage: storageHealthy ? "healthy" : "unhealthy",
      supportedTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      maxFileSize: "10MB",
    });
  }

  return handler(req);
};

serve(wrapFunction(healthHandler, requiredEnvVars, ["GET", "POST", "OPTIONS"]));
