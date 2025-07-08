import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  createGenericErrorHandler,
} from "../_shared/cors.ts";
import {
  validateAndCreateSupabaseClient,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

interface StudyResource {
  id?: string;
  title: string;
  description: string;
  content: string;
  resource_type: "note" | "summary" | "past_paper" | "tutorial" | "guide";
  university_id: string;
  course_code: string;
  year_level: number;
  semester: string;
  tags: string[];
  file_url?: string;
  created_by: string;
  is_verified: boolean;
  download_count: number;
  rating: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // Validate environment variables
    const missingEnvVars = validateRequiredEnvVars([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    const supabase = validateAndCreateSupabaseClient();

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    const method = req.method;

    // For write operations, get auth user if authorization header is provided
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && method !== "GET") {
      const token = authHeader.replace("Bearer ", "");
      const authResult = await supabase.auth.getUser(token);
      user = authResult.data?.user || null;
    }

    const action = url.searchParams.get("action");

    switch (method) {
      case "GET":
        if (action === "search" || path === "search") {
          return await handleSearch(supabase, url);
        } else if (action === "resources" || path === "resources") {
          return await getResources(supabase, url);
        } else if (url.pathname.includes("resources/")) {
          const id = url.pathname.split("/").pop();
          return await getResource(supabase, id!);
        }
        break;

      case "POST":
        if (!user) {
          return new Response(
            JSON.stringify({
              error: "Authentication required for write operations",
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        if (path === "resources") {
          const body = await req.json();
          return await createResource(supabase, body, user.id);
        } else if (path === "verify") {
          const body = await req.json();
          return await verifyResource(supabase, body, user.id);
        } else if (path === "rate") {
          const body = await req.json();
          return await rateResource(supabase, body, user.id);
        }
        break;

      case "PUT":
        if (!user) {
          return new Response(
            JSON.stringify({
              error: "Authentication required for write operations",
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        if (url.pathname.includes("resources/")) {
          const id = url.pathname.split("/").pop();
          const body = await req.json();
          return await updateResource(supabase, id!, body, user.id);
        }
        break;

      case "DELETE":
        if (!user) {
          return new Response(
            JSON.stringify({
              error: "Authentication required for write operations",
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        if (url.pathname.includes("resources/")) {
          const id = url.pathname.split("/").pop();
          return await deleteResource(supabase, id!, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSearch(supabase: any, url: URL) {
  const query = url.searchParams.get("q") || "";
  const university = url.searchParams.get("university");
  const course = url.searchParams.get("course");
  const type = url.searchParams.get("type");
  const year = url.searchParams.get("year");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let queryBuilder = supabase
    .from("study_resources")
    .select(
      `
      *,
      profiles:created_by(name, profile_picture_url),
      universities:university_id(name, logo_url)
    `,
    )
    .eq("is_verified", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`,
    );
  }

  if (university) queryBuilder = queryBuilder.eq("university_id", university);
  if (course) queryBuilder = queryBuilder.ilike("course_code", `%${course}%`);
  if (type) queryBuilder = queryBuilder.eq("resource_type", type);
  if (year) queryBuilder = queryBuilder.eq("year_level", year);

  const { data, error } = await queryBuilder;

  if (error) throw error;

  return new Response(JSON.stringify({ data, count: data?.length || 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getResources(supabase: any, url: URL) {
  const university = url.searchParams.get("university");
  const course = url.searchParams.get("course");
  const type = url.searchParams.get("type");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let queryBuilder = supabase
    .from("study_resources")
    .select(
      `
      *,
      profiles:created_by(name, profile_picture_url),
      universities:university_id(name, logo_url)
    `,
    )
    .eq("is_verified", true)
    .order("download_count", { ascending: false })
    .range(offset, offset + limit - 1);

  if (university) queryBuilder = queryBuilder.eq("university_id", university);
  if (course) queryBuilder = queryBuilder.eq("course_code", course);
  if (type) queryBuilder = queryBuilder.eq("resource_type", type);

  const { data, error } = await queryBuilder;

  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getResource(supabase: any, id: string) {
  const { data, error } = await supabase
    .from("study_resources")
    .select(
      `
      *,
      profiles:created_by(name, profile_picture_url, bio),
      universities:university_id(name, logo_url),
      study_resource_ratings(rating, user_id)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  // Increment download count
  await supabase
    .from("study_resources")
    .update({ download_count: data.download_count + 1 })
    .eq("id", id);

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createResource(
  supabase: any,
  resource: StudyResource,
  userId: string,
) {
  const { data, error } = await supabase
    .from("study_resources")
    .insert({
      ...resource,
      created_by: userId,
      is_verified: false,
      download_count: 0,
      rating: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for admins
  await supabase.from("notifications").insert({
    type: "new_study_resource",
    title: "New Study Resource Submitted",
    message: `A new study resource "${resource.title}" has been submitted for review.`,
    user_id: "admin", // Will be handled by admin notification system
    metadata: { resource_id: data.id, created_by: userId },
  });

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateResource(
  supabase: any,
  id: string,
  updates: Partial<StudyResource>,
  userId: string,
) {
  // Check if user owns the resource or is admin
  const { data: resource } = await supabase
    .from("study_resources")
    .select("created_by")
    .eq("id", id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (resource.created_by !== userId && !profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("study_resources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyResource(
  supabase: any,
  { resourceId, verified }: { resourceId: string; verified: boolean },
  userId: string,
) {
  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("study_resources")
    .update({ is_verified: verified })
    .eq("id", resourceId)
    .select()
    .single();

  if (error) throw error;

  // Notify the creator
  await supabase.from("notifications").insert({
    type: verified ? "resource_approved" : "resource_rejected",
    title: verified ? "Study Resource Approved" : "Study Resource Rejected",
    message: verified
      ? `Your study resource "${data.title}" has been approved and is now live.`
      : `Your study resource "${data.title}" has been rejected. Please review and resubmit.`,
    user_id: data.created_by,
    metadata: { resource_id: resourceId },
  });

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function rateResource(
  supabase: any,
  { resourceId, rating }: { resourceId: string; rating: number },
  userId: string,
) {
  if (rating < 1 || rating > 5) {
    return new Response(
      JSON.stringify({ error: "Rating must be between 1 and 5" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Insert or update rating
  const { error: ratingError } = await supabase
    .from("study_resource_ratings")
    .upsert({
      resource_id: resourceId,
      user_id: userId,
      rating,
    });

  if (ratingError) throw ratingError;

  // Calculate new average rating
  const { data: ratings } = await supabase
    .from("study_resource_ratings")
    .select("rating")
    .eq("resource_id", resourceId);

  const avgRating =
    ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length;

  // Update resource with new average
  const { data, error } = await supabase
    .from("study_resources")
    .update({ rating: Math.round(avgRating * 10) / 10 })
    .eq("id", resourceId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteResource(supabase: any, id: string, userId: string) {
  // Check permissions
  const { data: resource } = await supabase
    .from("study_resources")
    .select("created_by")
    .eq("id", id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (resource.created_by !== userId && !profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase
    .from("study_resources")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
