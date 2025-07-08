import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Study resources API request:", req.method, req.url);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Remove 'functions', 'v1', 'study-resources-api' from path
    const apiPath = pathSegments.slice(3).join("/");

    // Get current user for protected endpoints
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    switch (method) {
      case "GET":
        return await handleGet(supabaseClient, apiPath, url.searchParams, user);
      case "POST":
        return await handlePost(supabaseClient, apiPath, req, user);
      case "PUT":
        return await handlePut(supabaseClient, apiPath, req, user);
      case "DELETE":
        return await handleDelete(supabaseClient, apiPath, user);
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Study resources API error:", error);

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

async function handleGet(
  supabaseClient: any,
  path: string,
  params: URLSearchParams,
  user: any,
) {
  switch (path) {
    case "resources":
    case "":
      return await getResources(supabaseClient, params, user);
    case "categories":
      return await getCategories(supabaseClient);
    case "institutions":
      return await getInstitutions(supabaseClient);
    case "my-resources":
      return await getMyResources(supabaseClient, user, params);
    default:
      // Check if it's a resource ID
      if (path.match(/^[0-9a-f-]{36}$/)) {
        return await getResource(supabaseClient, path, user);
      }
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: corsHeaders,
      });
  }
}

async function handlePost(
  supabaseClient: any,
  path: string,
  req: Request,
  user: any,
) {
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const body = await req.json();

  switch (path) {
    case "resources":
    case "":
      return await createResource(supabaseClient, body, user);
    case "categories":
      return await createCategory(supabaseClient, body, user);
    case "download":
      return await recordDownload(supabaseClient, body, user);
    default:
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: corsHeaders,
      });
  }
}

async function handlePut(
  supabaseClient: any,
  path: string,
  req: Request,
  user: any,
) {
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const body = await req.json();

  // Check if it's a resource ID
  if (path.match(/^[0-9a-f-]{36}$/)) {
    return await updateResource(supabaseClient, path, body, user);
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: corsHeaders,
  });
}

async function handleDelete(supabaseClient: any, path: string, user: any) {
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Check if it's a resource ID
  if (path.match(/^[0-9a-f-]{36}$/)) {
    return await deleteResource(supabaseClient, path, user);
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: corsHeaders,
  });
}

async function getResources(
  supabaseClient: any,
  params: URLSearchParams,
  user: any,
) {
  let query = supabaseClient
    .from("study_resources")
    .select(
      `
      *,
      creator:created_by(id, full_name),
      category:category_id(name, description),
      institution:institution_id(name, abbreviation),
      downloads_count:study_resource_downloads(count)
    `,
    )
    .eq("is_active", true);

  // Apply filters
  const category = params.get("category");
  const institution = params.get("institution");
  const search = params.get("search");
  const resource_type = params.get("type");
  const subject = params.get("subject");
  const level = params.get("level");

  if (category) query = query.eq("category_id", category);
  if (institution) query = query.eq("institution_id", institution);
  if (resource_type) query = query.eq("resource_type", resource_type);
  if (subject) query = query.ilike("subject", `%${subject}%`);
  if (level) query = query.eq("academic_level", level);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`,
    );
  }

  // Sorting
  const sort = params.get("sort") || "created_at";
  const order = params.get("order") || "desc";
  query = query.order(sort, { ascending: order === "asc" });

  // Pagination
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "20");
  const offset = (page - 1) * limit;

  query = query.range(offset, offset + limit - 1);

  const { data: resources, error } = await query;

  if (error) {
    console.error("Database error fetching resources:", error);

    // Fallback: Return static demo resources
    return new Response(
      JSON.stringify({
        success: true,
        data: [
          {
            id: "demo-1",
            title: "Study Resources Temporarily Unavailable",
            description:
              "Our database is experiencing issues. Please try again later.",
            resource_type: "announcement",
            subject: "System Notice",
            academic_level: "all",
            created_at: new Date().toISOString(),
            is_active: true,
            creator: { full_name: "System" },
            downloads_count: 0,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
        fallback: true,
        error: "Database temporarily unavailable",
      }),
      {
        headers: corsHeaders,
      },
    );
  }

  // Get total count for pagination
  const { count, error: countError } = await supabaseClient
    .from("study_resources")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return new Response(
    JSON.stringify({
      success: true,
      data: resources,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function getResource(supabaseClient: any, resourceId: string, user: any) {
  const { data: resource, error } = await supabaseClient
    .from("study_resources")
    .select(
      `
      *,
      creator:created_by(id, full_name),
      category:category_id(name, description),
      institution:institution_id(name, abbreviation),
      downloads_count:study_resource_downloads(count)
    `,
    )
    .eq("id", resourceId)
    .eq("is_active", true)
    .single();

  if (error || !resource) {
    return new Response(JSON.stringify({ error: "Resource not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: resource,
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function getMyResources(
  supabaseClient: any,
  user: any,
  params: URLSearchParams,
) {
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let query = supabaseClient
    .from("study_resources")
    .select(
      `
      *,
      category:category_id(name, description),
      institution:institution_id(name, abbreviation),
      downloads_count:study_resource_downloads(count)
    `,
    )
    .eq("created_by", user.id);

  // Pagination
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "20");
  const offset = (page - 1) * limit;

  query = query.range(offset, offset + limit - 1);
  query = query.order("created_at", { ascending: false });

  const { data: resources, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch user resources: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: resources,
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function createResource(supabaseClient: any, body: any, user: any) {
  const {
    title,
    description,
    resource_type,
    subject,
    academic_level,
    category_id,
    institution_id,
    file_url,
    file_size,
    file_type,
    tags = [],
  } = body;

  if (!title || !description || !resource_type || !file_url) {
    return new Response(
      JSON.stringify({
        error:
          "Missing required fields: title, description, resource_type, file_url",
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const { data: resource, error } = await supabaseClient
    .from("study_resources")
    .insert({
      title,
      description,
      resource_type,
      subject,
      academic_level,
      category_id,
      institution_id,
      file_url,
      file_size,
      file_type,
      tags,
      created_by: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create resource: ${error.message}`);
  }

  // Log audit trail
  await supabaseClient.from("audit_logs").insert({
    action: "study_resource_created",
    table_name: "study_resources",
    record_id: resource.id,
    user_id: user.id,
    details: { title, resource_type, subject },
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: resource,
      message: "Resource created successfully",
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function updateResource(
  supabaseClient: any,
  resourceId: string,
  body: any,
  user: any,
) {
  // Check if user owns the resource
  const { data: existingResource, error: checkError } = await supabaseClient
    .from("study_resources")
    .select("created_by")
    .eq("id", resourceId)
    .single();

  if (checkError || !existingResource) {
    return new Response(JSON.stringify({ error: "Resource not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  if (existingResource.created_by !== user.id) {
    return new Response(
      JSON.stringify({ error: "Not authorized to update this resource" }),
      {
        status: 403,
        headers: corsHeaders,
      },
    );
  }

  const updateData = { ...body, updated_at: new Date().toISOString() };
  delete updateData.id;
  delete updateData.created_by;
  delete updateData.created_at;

  const { data: resource, error } = await supabaseClient
    .from("study_resources")
    .update(updateData)
    .eq("id", resourceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update resource: ${error.message}`);
  }

  // Log audit trail
  await supabaseClient.from("audit_logs").insert({
    action: "study_resource_updated",
    table_name: "study_resources",
    record_id: resourceId,
    user_id: user.id,
    details: { updated_fields: Object.keys(updateData) },
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: resource,
      message: "Resource updated successfully",
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function deleteResource(
  supabaseClient: any,
  resourceId: string,
  user: any,
) {
  // Check if user owns the resource
  const { data: existingResource, error: checkError } = await supabaseClient
    .from("study_resources")
    .select("created_by, title")
    .eq("id", resourceId)
    .single();

  if (checkError || !existingResource) {
    return new Response(JSON.stringify({ error: "Resource not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  if (existingResource.created_by !== user.id) {
    return new Response(
      JSON.stringify({ error: "Not authorized to delete this resource" }),
      {
        status: 403,
        headers: corsHeaders,
      },
    );
  }

  // Soft delete by marking as inactive
  const { error } = await supabaseClient
    .from("study_resources")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resourceId);

  if (error) {
    throw new Error(`Failed to delete resource: ${error.message}`);
  }

  // Log audit trail
  await supabaseClient.from("audit_logs").insert({
    action: "study_resource_deleted",
    table_name: "study_resources",
    record_id: resourceId,
    user_id: user.id,
    details: { title: existingResource.title },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Resource deleted successfully",
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function recordDownload(supabaseClient: any, body: any, user: any) {
  const { resource_id } = body;

  if (!resource_id) {
    return new Response(JSON.stringify({ error: "Resource ID is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Record download
  const { error } = await supabaseClient
    .from("study_resource_downloads")
    .insert({
      resource_id,
      user_id: user.id,
      downloaded_at: new Date().toISOString(),
    });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to record download: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Download recorded",
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function getCategories(supabaseClient: any) {
  const { data: categories, error } = await supabaseClient
    .from("study_resource_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: categories,
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function createCategory(supabaseClient: any, body: any, user: any) {
  const { name, description } = body;

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Category name is required" }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const { data: category, error } = await supabaseClient
    .from("study_resource_categories")
    .insert({
      name,
      description,
      created_by: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: category,
      message: "Category created successfully",
    }),
    {
      headers: corsHeaders,
    },
  );
}

async function getInstitutions(supabaseClient: any) {
  const { data: institutions, error } = await supabaseClient
    .from("institutions")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch institutions: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: institutions,
    }),
    {
      headers: corsHeaders,
    },
  );
}
