-- Migration: Create delivery errors tracking table
-- Date: 2025-01-22
-- Description: Creates a table to track delivery automation errors for admin review

-- Create delivery_errors table
CREATE TABLE IF NOT EXISTS public.delivery_errors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    error_message text NOT NULL,
    error_stack text,
    resolved boolean DEFAULT false,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_errors_order_id ON public.delivery_errors(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_resolved ON public.delivery_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_created_at ON public.delivery_errors(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_delivery_errors_updated_at
    BEFORE UPDATE ON public.delivery_errors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.delivery_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admins only)
CREATE POLICY "Admins can manage delivery errors" ON public.delivery_errors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.delivery_errors TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.delivery_errors IS 'Tracks delivery automation errors for admin review and debugging';
COMMENT ON COLUMN public.delivery_errors.error_message IS 'Human-readable error message';
COMMENT ON COLUMN public.delivery_errors.error_stack IS 'Full error stack trace for debugging';
COMMENT ON COLUMN public.delivery_errors.resolved IS 'Whether the error has been addressed by an admin';

SELECT 'Delivery errors tracking table created successfully!' as status;
