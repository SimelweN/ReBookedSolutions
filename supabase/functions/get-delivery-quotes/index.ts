
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fromAddress, toAddress, parcel } = await req.json();

    if (!fromAddress || !toAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required address information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parcelData = {
      length: parcel?.length || 20,
      width: parcel?.width || 15,
      height: parcel?.height || 5,
      weight: parcel?.weight || 0.5
    };

    // Get quotes from multiple providers
    const quotePromises = [
      getQuote('courier-guy', fromAddress, toAddress, parcelData),
      getQuote('fastway', fromAddress, toAddress, parcelData)
    ];

    const results = await Promise.allSettled(quotePromises);
    
    const allQuotes: any[] = [];
    const providers: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        allQuotes.push(...result.value.quotes);
        providers.push(result.value.provider);
      }
    });

    // Add self-collection option
    allQuotes.push({
      service: 'Self Collection',
      price: 0,
      currency: 'ZAR',
      estimated_days: 'Immediate',
      service_code: 'SELF',
      provider: 'self'
    });

    // Sort by price
    allQuotes.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({
        success: true,
        quotes: allQuotes,
        providers: [...providers, 'self'],
        total_quotes: allQuotes.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-delivery-quotes:', error);
    
    // Return basic fallback quotes
    return new Response(
      JSON.stringify({
        success: true,
        quotes: [
          {
            service: 'Self Collection',
            price: 0,
            currency: 'ZAR',
            estimated_days: 'Immediate',
            service_code: 'SELF',
            provider: 'self'
          },
          {
            service: 'Standard Delivery',
            price: 75.00,
            currency: 'ZAR',
            estimated_days: '2-3',
            service_code: 'STD',
            provider: 'fallback'
          }
        ],
        providers: ['self', 'fallback'],
        fallback: true,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getQuote(provider: string, fromAddress: any, toAddress: any, parcel: any) {
  const functionName = provider === 'courier-guy' ? 'courier-guy-quote' : 'fastway-quote';
  
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromAddress,
        toAddress,
        parcel
      })
    });

    if (!response.ok) {
      throw new Error(`${provider} quote failed`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error getting ${provider} quote:`, error);
    return { success: false, error: error.message };
  }
}
