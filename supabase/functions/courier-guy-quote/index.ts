
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COURIER_GUY_API_KEY = Deno.env.get('COURIER_GUY_API_KEY');

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
    if (!COURIER_GUY_API_KEY) {
      console.log('Using fallback Courier Guy quote');
      return new Response(
        JSON.stringify({
          success: true,
          quotes: [
            {
              service: 'Standard Overnight',
              price: 89.00,
              currency: 'ZAR',
              estimated_days: '1-2',
              service_code: 'ON'
            },
            {
              service: 'Economy',
              price: 65.00,
              currency: 'ZAR',
              estimated_days: '2-3',
              service_code: 'EC'
            }
          ],
          provider: 'courier-guy'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real Courier Guy API integration
    const quoteData = {
      collection_address: {
        street_address: fromAddress.streetAddress,
        suburb: fromAddress.suburb,
        city: fromAddress.city,
        postal_code: fromAddress.postalCode,
        province: fromAddress.province
      },
      delivery_address: {
        street_address: toAddress.streetAddress,
        suburb: toAddress.suburb,
        city: toAddress.city,
        postal_code: toAddress.postalCode,
        province: toAddress.province
      },
      parcel: {
        submitted_length_cm: parcel.length || 20,
        submitted_width_cm: parcel.width || 15,
        submitted_height_cm: parcel.height || 5,
        submitted_weight_kg: parcel.weight || 0.5
      }
    };

    const response = await fetch('https://api.courierguy.co.za/v1/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COURIER_GUY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Courier Guy API error:', data);
      // Return fallback quote on API error
      return new Response(
        JSON.stringify({
          success: true,
          quotes: [
            {
              service: 'Standard Overnight',
              price: 89.00,
              currency: 'ZAR',
              estimated_days: '1-2',
              service_code: 'ON'
            }
          ],
          provider: 'courier-guy',
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform API response to standard format
    const quotes = data.rates?.map((rate: any) => ({
      service: rate.service_name,
      price: parseFloat(rate.rate),
      currency: 'ZAR',
      estimated_days: rate.delivery_time,
      service_code: rate.service_code
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        quotes,
        provider: 'courier-guy'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in courier-guy-quote:', error);
    
    // Return fallback quote on any error
    return new Response(
      JSON.stringify({
        success: true,
        quotes: [
          {
            service: 'Standard Overnight',
            price: 89.00,
            currency: 'ZAR',
            estimated_days: '1-2',
            service_code: 'ON'
          }
        ],
        provider: 'courier-guy',
        fallback: true,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
