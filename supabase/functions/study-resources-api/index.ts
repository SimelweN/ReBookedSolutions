import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["GET", "POST", "OPTIONS"];

interface SearchParams {
  query?: string;
  subject?: string;
  academic_level?: string;
  institution_id?: string;
  category_id?: string;
  limit?: number;
  offset?: number;
}

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const action = segments[segments.length - 1];

  // Handle GET requests (health check and simple queries)
  if (req.method === "GET") {
    if (action === "health" || url.pathname.endsWith("/study-resources-api")) {
      return successResponse({
        service: "study-resources-api",
        timestamp: new Date().toISOString(),
        status: "healthy",
        version: "2.0.0",
        endpoints: [
          "GET /health - Health check",
          "POST /search - Search resources",
          "POST /create - Create resource",
          "POST /get - Get resource by ID",
          "GET /search?query=... - Simple search",
        ],
      });
    }

    // Handle simple GET search
    if (action === "search") {
      const query = url.searchParams.get("query") || "";
      const subject = url.searchParams.get("subject");
      const limit = parseInt(url.searchParams.get("limit") || "10");

      return await handleSimpleSearch(supabase, { query, subject, limit });
    }

    return errorResponse("Invalid GET endpoint", 404, "ENDPOINT_NOT_FOUND");
  }

  // Handle POST requests
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  const { action: postAction } = requestBody;

  switch (postAction) {
    case "health":
      return successResponse(
        {
          service: "study-resources-api",
          timestamp: new Date().toISOString(),
          status: "healthy",
          database: await testDatabaseConnection(supabase),
        },
        "Study Resources API is healthy",
      );

    case "search":
      return await handleSearch(supabase, requestBody);

    case "create":
      return await handleCreate(supabase, requestBody);

    case "get":
      return await handleGet(supabase, requestBody);

    case "rate":
      return await handleRate(supabase, requestBody);

    case "verify":
      return await handleVerify(supabase, requestBody);

    default:
      return errorResponse(
        `Invalid action: ${postAction}. Supported actions: health, search, create, get, rate, verify`,
        400,
        "INVALID_ACTION",
        {
          supportedActions: [
            "health",
            "search",
            "create",
            "get",
            "rate",
            "verify",
          ],
        },
      );
  }
};

const testDatabaseConnection = async (supabase: any): Promise<string> => {
  try {
    const { error } = await supabase
      .from("study_resources")
      .select("count")
      .limit(1);
    return error ? "error" : "healthy";
  } catch {
    return "error";
  }
};

const handleSimpleSearch = async (
  supabase: any,
  params: SearchParams,
): Promise<Response> => {
  try {
    let query = supabase
      .from("study_resources")
      .select(
        `
        id,
        title,
        description,
        resource_type,
        subject,
        academic_level,
        file_url,
        tags,
        created_at,
        study_resource_categories(name),
        institutions(name, abbreviation)
      `,
      )
      .eq("is_active", true);

    if (params.query) {
      query = query.or(
        `title.ilike.%${params.query}%,description.ilike.%${params.query}%,subject.ilike.%${params.query}%`,
      );
    }

    if (params.subject) {
      query = query.eq("subject", params.subject);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(params.limit || 10);

    if (error) {
      return errorResponse("Database query failed", 500, "DATABASE_ERROR", {
        error: error.message,
      });
    }

    return successResponse(
      {
        resources: data || [],
        total: data?.length || 0,
        query: params,
      },
      `Found ${data?.length || 0} resources`,
    );
  } catch (error) {
    return errorResponse("Search failed", 500, "SEARCH_ERROR", {
      error: error.message,
    });
  }
};

const handleSearch = async (supabase: any, body: any): Promise<Response> => {
  const {
    query = "",
    subject,
    academic_level,
    institution_id,
    category_id,
    limit = 20,
    offset = 0,
  } = body;

  try {
    let dbQuery = supabase
      .from("study_resources")
      .select(
        `
        id,
        title,
        description,
        resource_type,
        subject,
        academic_level,
        file_url,
        file_size,
        file_type,
        tags,
        created_at,
        study_resource_categories(id, name),
        institutions(id, name, abbreviation),
        created_by
      `,
      )
      .eq("is_active", true);

    // Apply filters
    if (query) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%,tags.cs.{${query}}`,
      );
    }

    if (subject) {
      dbQuery = dbQuery.eq("subject", subject);
    }

    if (academic_level) {
      dbQuery = dbQuery.eq("academic_level", academic_level);
    }

    if (institution_id) {
      dbQuery = dbQuery.eq("institution_id", institution_id);
    }

    if (category_id) {
      dbQuery = dbQuery.eq("category_id", category_id);
    }

    const { data, error } = await dbQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return errorResponse("Database query failed", 500, "DATABASE_ERROR", {
        error: error.message,
      });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("study_resources")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    return successResponse(
      {
        resources: data || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
        filters: {
          query,
          subject,
          academic_level,
          institution_id,
          category_id,
        },
      },
      `Found ${data?.length || 0} resources`,
    );
  } catch (error) {
    return errorResponse("Search failed", 500, "SEARCH_ERROR", {
      error: error.message,
    });
  }
};

const handleCreate = async (supabase: any, body: any): Promise<Response> => {
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
    tags,
    created_by,
  } = body;

  // Validate required fields
  if (!title || !description || !resource_type || !file_url || !created_by) {
    return errorResponse(
      "Missing required fields: title, description, resource_type, file_url, created_by",
      400,
      "REQUIRED_FIELDS_MISSING",
      {
        required: [
          "title",
          "description",
          "resource_type",
          "file_url",
          "created_by",
        ],
      },
    );
  }

  try {
    const { data, error } = await supabase
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
        created_by,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return errorResponse("Failed to create resource", 500, "CREATE_ERROR", {
        error: error.message,
      });
    }

    return successResponse(data, "Resource created successfully");
  } catch (error) {
    return errorResponse("Create operation failed", 500, "CREATE_FAILED", {
      error: error.message,
    });
  }
};

const handleGet = async (supabase: any, body: any): Promise<Response> => {
  const { id, resource_id } = body;
  const resourceId = id || resource_id;

  if (!resourceId) {
    return errorResponse("Resource ID is required", 400, "ID_MISSING");
  }

  try {
    const { data, error } = await supabase
      .from("study_resources")
      .select(
        `
        *,
        study_resource_categories(id, name, description),
        institutions(id, name, abbreviation, province),
        profiles!created_by(id, full_name)
      `,
      )
      .eq("id", resourceId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Resource not found", 404, "RESOURCE_NOT_FOUND");
      }
      return errorResponse("Database query failed", 500, "DATABASE_ERROR", {
        error: error.message,
      });
    }

    return successResponse(data, "Resource retrieved successfully");
  } catch (error) {
    return errorResponse("Get operation failed", 500, "GET_FAILED", {
      error: error.message,
    });
  }
};

const handleRate = async (supabase: any, body: any): Promise<Response> => {
  // This would implement resource rating functionality
  return successResponse(
    {
      message: "Rating functionality not yet implemented",
    },
    "Rating endpoint placeholder",
  );
};

const handleVerify = async (supabase: any, body: any): Promise<Response> => {
  // This would implement resource verification functionality
  return successResponse(
    {
      message: "Verification functionality not yet implemented",
    },
    "Verification endpoint placeholder",
  );
};

serve(wrapFunction(handler, requiredEnvVars, allowedMethods));
