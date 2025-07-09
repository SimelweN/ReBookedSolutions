import { supabase } from "@/integrations/supabase/client";

// Function to create the missing get_table_names RPC function
export const createGetTableNamesFunction = async () => {
  const functionSQL = `
    -- Create RPC function to get table names for the dev dashboard
    CREATE OR REPLACE FUNCTION get_table_names()
    RETURNS TABLE (
      table_name TEXT,
      table_schema TEXT,
      table_type TEXT
    ) 
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.table_name::TEXT,
        t.table_schema::TEXT,
        t.table_type::TEXT
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name;
    END;
    $$;

    -- Grant execution permission to authenticated users
    GRANT EXECUTE ON FUNCTION get_table_names() TO authenticated;
  `;

  try {
    // Note: This would typically require a service role key to execute DDL operations
    // For security reasons, we'll need to execute this through the Supabase dashboard
    console.log("SQL to execute in Supabase SQL Editor:");
    console.log(functionSQL);

    return {
      success: false,
      message: "Please execute the SQL above in your Supabase SQL Editor",
      sql: functionSQL,
    };
  } catch (error) {
    console.error("Error creating RPC function:", error);
    return {
      success: false,
      message: `Error: ${error}`,
      sql: functionSQL,
    };
  }
};

// Alternative function that attempts to test if the function exists
export const testGetTableNamesFunction = async () => {
  try {
    const { data, error } = await supabase.rpc("get_table_names", {});

    if (
      error &&
      error.message?.includes("function get_table_names() does not exist")
    ) {
      return {
        exists: false,
        error: "Function does not exist",
        needsCreation: true,
      };
    }

    return {
      exists: !error,
      data: data || [],
      error: error?.message,
    };
  } catch (error) {
    return {
      exists: false,
      error: `Test failed: ${error}`,
      needsCreation: true,
    };
  }
};
