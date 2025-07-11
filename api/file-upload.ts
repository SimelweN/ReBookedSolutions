import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Node.js modules - only loaded in Node.js environment
let formidable: any = null;
let fs: any = null;

// Only load in Node.js environment
if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  try {
    // Use eval to avoid bundler processing in Workers
    const req = eval("require");
    formidable = req("formidable");
    fs = req("fs");
  } catch (error) {
    console.warn("Node.js modules not available");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: VercelRequest,
): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    if (!formidable) {
      reject(new Error("File upload not supported in this environment"));
      return;
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 1,
      allowEmptyFiles: false,
      filter: ({ mimetype }: any) => {
        // Allow images, PDFs, and documents
        return Boolean(
          mimetype &&
            (mimetype.includes("image/") ||
              mimetype.includes("application/pdf") ||
              mimetype.includes("text/") ||
              mimetype.includes("application/msword") ||
              mimetype.includes(
                "application/vnd.openxmlformats-officedocument",
              )),
        );
      },
    });

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Early exit for Workers/Edge environments that don't support file uploads
  if (
    typeof process === "undefined" ||
    !process.versions ||
    !process.versions.node
  ) {
    return res.status(501).json({
      success: false,
      error: "File upload not supported in this runtime environment",
    });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check for GET requests
  if (req.method === "GET") {
    return res.status(200).json({
      service: "file-upload",
      timestamp: new Date().toISOString(),
      status: "healthy",
      maxFileSize: "10MB",
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
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Check if required modules are available
  if (!formidable || !fs) {
    return res.status(500).json({
      success: false,
      error: "File upload not supported in this environment",
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Parse the multipart form data
    const { fields, files } = await parseForm(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const bucket = Array.isArray(fields.bucket)
      ? fields.bucket[0]
      : fields.bucket || "book-images";
    const userId = Array.isArray(fields.userId)
      ? fields.userId[0]
      : fields.userId;
    const folder = Array.isArray(fields.folder)
      ? fields.folder[0]
      : fields.folder;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
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

    if (!allowedTypes.includes(file.mimetype || "")) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(", ")}`,
      });
    }

    // Validate file size (already handled by formidable, but double-check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is 10MB.`,
      });
    }

    // Generate secure filename
    const fileExtension =
      file.originalFilename?.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedOriginalName =
      file.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50) ||
      "file";

    const folderPath = folder ? `${folder}/` : "";
    const fileName = `${folderPath}${userId}/${timestamp}-${randomString}-${sanitizedOriginalName}`;

    // Read file data
    if (!fs) {
      return res.status(500).json({
        success: false,
        error: "File system operations not supported in this environment",
      });
    }

    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload file to storage",
        details: uploadError.message,
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate public URL",
      });
    }

    // Log the upload (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
        action: "file_uploaded",
        table_name: "storage",
        user_id: userId,
        new_values: {
          bucket,
          fileName: uploadData.path,
          originalName: file.originalFilename,
          fileSize: file.size,
          contentType: file.mimetype,
          publicUrl: publicUrlData.publicUrl,
        },
      });
    } catch (error: any) {
      console.warn("Failed to log file upload:", error.message);
    }

    // Clean up temporary file
    try {
      if (fs) {
        fs.unlinkSync(file.filepath);
      }
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary file:", cleanupError);
    }

    return res.status(200).json({
      success: true,
      fileName: uploadData.path,
      publicUrl: publicUrlData.publicUrl,
      fileSize: file.size,
      contentType: file.mimetype,
      originalName: file.originalFilename,
      bucket,
      message: "File uploaded successfully",
    });
  } catch (error: unknown) {
    console.error("Unexpected error in file-upload:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred during file upload",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
