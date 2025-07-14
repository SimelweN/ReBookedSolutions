
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FASTWAY_API_KEY = Deno.env.get('FASTWAY_API_KEY');

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

    if (!fromAddress || !toAddress || !parcel) {
      return new Response(
        JSON.stringify({ error: 'Missing required address or parcel information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback quote for development/testing
    if (!FASTWAY_API_KEY) {
      console.log('Using fallback Fastway quote');
      return new Response(
        JSON.stringify({
          success: true,
          quotes: [
            {
              service: 'Local Parcel',
              price: 55.00,
              currency: 'ZAR',
              estimated_days: '1-2',
              service_code: 'LP'
            },
            {
              service: 'Road Freight',
              price: 85.00,
              currency: 'ZAR',
              estimated_days: '2-4',
              service_code: 'RF'
            }
          ],
          provider: 'fastway'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real Fastway API integration would go here
    const quoteData = {
      PickupAddress: {
        Street: fromAddress.streetAddress,
        Suburb: fromAddress.suburb,
        City: fromAddress.city,
        PostalCode: fromAddress.postalCode,
        Province: fromAddress.province
      },
      DestinationAddress: {
        Street: toAddress.streetAddress,
        Suburb: toAddress.suburb,
        City: toAddress.city,
        PostalCode: toAddress.postalCode,
        Province: toAddress.province
      },
      Parcel: {
        Length: parcel.length || 20,
        Width: parcel.width || 15,
        Height: parcel.height || 5,
        Weight: parcel.weight || 0.5
      }
    };

    // Simulate API call (replace with actual Fastway API endpoint)
    try {
      const response = await fetch('https://api.fastway.co.za/v1/quote', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FASTWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Fastway API error');
      }

      const data = await response.json();

      // Transform API response to standard format
      const quotes = data.quotes?.map((quote: any) => ({
        service: quote.service_name,
        price: parseFloat(quote.price),
        currency: 'ZAR',
        estimated_days: quote.delivery_time,
        service_code: quote.service_code
      })) || [];

      return new Response(
        JSON.stringify({
          success: true,
          quotes,
          provider: 'fastway'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('Fastway API error:', apiError);
      
      // Return fallback quote on API error
      return new Response(
        JSON.stringify({
          success: true,
          quotes: [
            {
              service: 'Local Parcel',
              price: 55.00,
              currency: 'ZAR',
              estimated_days: '1-2',
              service_code: 'LP'
            }
          ],
          provider: 'fastway',
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in fastway-quote:', error);
    
    // Return fallback quote on any error
    return new Response(
      JSON.stringify({
        success: true,
        quotes: [
          {
            service: 'Local Parcel',
            price: 55.00,
            currency: 'ZAR',
            estimated_days: '1-2',
            service_code: 'LP'
          }
        ],
        provider: 'fastway',
        fallback: true,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
