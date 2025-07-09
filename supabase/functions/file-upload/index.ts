import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("File upload request:", req.method);
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "book-images";
    const userId = formData.get("userId") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage with retry mechanism
    let uploadData = null;
    let uploadError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`File upload attempt ${attempt}/3`);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          uploadError = error;
          console.error(`Upload attempt ${attempt} failed:`, error);

          if (attempt < 3) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        } else {
          uploadData = data;
          break;
        }
      } catch (err) {
        uploadError = err;
        console.error(`Upload attempt ${attempt} error:`, err);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!uploadData) {
      console.error("All upload attempts failed:", uploadError);

      // Fallback: Store file info for manual processing
      return new Response(
        JSON.stringify({
          success: false,
          error: "File upload temporarily unavailable",
          fallback: true,
          details:
            "File upload service is experiencing issues. Please try again later or contact support.",
          file_info: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          retry_instructions:
            "Your file was not uploaded. Please save it and try uploading again in a few minutes.",
        }),
        {
          status: 503,
          headers: corsHeaders,
        },
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Log the upload
    await supabase.from("audit_logs").insert({
      action: "file_uploaded",
      table_name: "storage",
      user_id: userId,
      new_values: {
        bucket,
        fileName,
        fileSize: file.size,
        contentType: file.type,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        fileName: uploadData.path,
        publicUrl: publicUrlData.publicUrl,
        fileSize: file.size,
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in file-upload:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
