-- Create RPC function to get table names for the dev dashboard
-- This function returns a list of all tables in the public schema

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

-- Add helpful comment
COMMENT ON FUNCTION get_table_names() IS 'Returns list of tables in public schema for development dashboard';
