
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SearchFilters {
  query?: string;
  category?: string;
  condition?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  grade?: string;
  availability?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'relevance';
  limit?: number;
  offset?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const filters: SearchFilters = await req.json();
    const results = await performAdvancedSearch(filters);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in advanced-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function performAdvancedSearch(filters: SearchFilters) {
  const {
    query = '',
    category,
    condition,
    university,
    minPrice,
    maxPrice,
    location,
    grade,
    availability = 'available',
    sortBy = 'newest',
    limit = 20,
    offset = 0
  } = filters;

  let dbQuery = supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      description,
      price,
      category,
      condition,
      image_url,
      seller_id,
      created_at,
      sold,
      university,
      grade,
      availability,
      province
    `)
    .eq('sold', false);

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  if (condition) {
    dbQuery = dbQuery.eq('condition', condition);
  }

  if (university) {
    dbQuery = dbQuery.eq('university', university);
  }

  if (grade) {
    dbQuery = dbQuery.eq('grade', grade);
  }

  if (availability) {
    dbQuery = dbQuery.eq('availability', availability);
  }

  if (location) {
    dbQuery = dbQuery.eq('province', location);
  }

  if (minPrice !== undefined) {
    dbQuery = dbQuery.gte('price', minPrice);
  }

  if (maxPrice !== undefined) {
    dbQuery = dbQuery.lte('price', maxPrice);
  }

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
  }

  switch (sortBy) {
    case 'price_asc':
      dbQuery = dbQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      dbQuery = dbQuery.order('price', { ascending: false });
      break;
    case 'oldest':
      dbQuery = dbQuery.order('created_at', { ascending: true });
      break;
    case 'newest':
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
  }

  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: books, error } = await dbQuery;

  if (error) {
    throw error;
  }

  let totalQuery = supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('sold', false);

  if (category) totalQuery = totalQuery.eq('category', category);
  if (condition) totalQuery = totalQuery.eq('condition', condition);
  if (university) totalQuery = totalQuery.eq('university', university);
  if (grade) totalQuery = totalQuery.eq('grade', grade);
  if (availability) totalQuery = totalQuery.eq('availability', availability);
  if (location) totalQuery = totalQuery.eq('province', location);
  if (minPrice !== undefined) totalQuery = totalQuery.gte('price', minPrice);
  if (maxPrice !== undefined) totalQuery = totalQuery.lte('price', maxPrice);
  if (query) {
    totalQuery = totalQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { count: total } = await totalQuery;

  return {
    books: books || [],
    total: total || 0,
    hasMore: (total || 0) > offset + limit,
    filters: filters
  };
}
