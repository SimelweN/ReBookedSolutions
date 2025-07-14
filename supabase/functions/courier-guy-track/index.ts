
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
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const trackingNumber = url.searchParams.get('tracking_number');

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ error: 'Tracking number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback for development/testing
    if (!COURIER_GUY_API_KEY) {
      console.log('Using fallback Courier Guy tracking');
      return new Response(
        JSON.stringify({
          success: true,
          tracking: {
            tracking_number: trackingNumber,
            status: 'in_transit',
            events: [
              {
                timestamp: new Date().toISOString(),
                status: 'picked_up',
                description: 'Package picked up from sender'
              },
              {
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                status: 'created',
                description: 'Shipment created'
              }
            ]
          },
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`https://api.courierguy.co.za/v1/shipments/${trackingNumber}/tracking`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COURIER_GUY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Courier Guy tracking API error:', data);
      // Return fallback tracking on API error
      return new Response(
        JSON.stringify({
          success: true,
          tracking: {
            tracking_number: trackingNumber,
            status: 'unknown',
            events: [{
              timestamp: new Date().toISOString(),
              status: 'unknown',
              description: 'Unable to retrieve tracking information'
            }]
          },
          fallback: true,
          error: data.message || 'API error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking: {
          tracking_number: trackingNumber,
          status: data.status,
          events: data.events || []
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in courier-guy-track:', error);
    
    const url = new URL(req.url);
    const trackingNumber = url.searchParams.get('tracking_number');
    
    return new Response(
      JSON.stringify({
        success: true,
        tracking: {
          tracking_number: trackingNumber || 'unknown',
          status: 'error',
          events: [{
            timestamp: new Date().toISOString(),
            status: 'error',
            description: 'Error retrieving tracking information'
          }]
        },
        fallback: true,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
