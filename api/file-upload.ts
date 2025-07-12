import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rateLimit, rateLimitConfigs } from "./utils/rate-limiter";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Early environment check - completely exit if not in Node.js
const isNodeJS =
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node &&
  typeof require !== "undefined";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Immediate exit for non-Node.js environments (Workers/Edge)
  if (!isNodeJS) {
    return res.status(501).json({
      success: false,
      error:
        "File upload requires Node.js runtime and is not available in this environment",
    });
  }

  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a valid bearer token.",
    });
  }

  // Dynamic Node.js module loading - only executed in Node.js
  let formidable: any;
  let fs: any;
  let createClient: any;

  try {
    // Dynamic imports to avoid bundler processing
    formidable = await import("formidable");
    fs = await import("fs");
    const supabase = await import("@supabase/supabase-js");
    createClient = supabase.createClient;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Required modules not available",
    });
  }

  // CORS headers - restrict to specific domains
  const allowedOrigins = [
    "https://rebookedsolutions.co.za",
    "https://www.rebookedsolutions.co.za",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check for GET requests
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "File upload API is healthy",
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

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Parse form helper function
    const parseForm = (
      req: VercelRequest,
    ): Promise<{ fields: any; files: any }> => {
      return new Promise((resolve, reject) => {
        const form = formidable.default({
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 1,
          allowEmptyFiles: false,
          filter: ({ mimetype }: any) => {
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

    // Parse the multipart form data
    const { fields, files } = await parseForm(req);

    if (!files.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const userId = Array.isArray(fields.userId)
      ? fields.userId[0]
      : fields.userId;
    const folderPath = Array.isArray(fields.folderPath)
      ? fields.folderPath[0]
      : fields.folderPath || "";

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

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `File type ${file.mimetype} not allowed`,
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedOriginalName =
      file.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50) ||
      "file";

    const bucket = "user-files";
    const fileName = `${folderPath}${userId}/${timestamp}-${randomString}-${sanitizedOriginalName}`;

    // Read file data
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

    const fileUrl = publicUrlData.publicUrl;

    // Log successful upload
    try {
      await supabase.from("file_uploads").insert({
        user_id: userId,
        file_name: sanitizedOriginalName,
        file_path: fileName,
        file_size: file.size,
        file_type: file.mimetype,
        bucket: bucket,
        uploaded_at: new Date().toISOString(),
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
      console.warn("Failed to cleanup temp file:", cleanupError);
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: sanitizedOriginalName,
        filePath: fileName,
        fileUrl: fileUrl,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to upload file",
      details: error.message,
    });
  }
}
