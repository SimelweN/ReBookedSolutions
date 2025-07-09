import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for health check first
    const contentType = req.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const body = await req.json();
        if (body.action === "health") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "File upload function is healthy",
              timestamp: new Date().toISOString(),
              version: "1.0.0",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch {
        // Not JSON, continue with form data handling
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "book-images";
    const userId = formData.get("userId") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return new Response(JSON.stringify({ error: "Failed to upload file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        fileName: data.path,
        publicUrl: publicUrlData.publicUrl,
        fileSize: file.size,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in file-upload:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
