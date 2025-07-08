-- Comprehensive Backend Features Migration
-- Creates all missing tables and functionality for backend systems

-- =============================================
-- STUDY RESOURCES SYSTEM
-- =============================================

-- Create study resources table
CREATE TABLE IF NOT EXISTS study_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('note', 'summary', 'past_paper', 'tutorial', 'guide', 'assignment')),
  university_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 6),
  semester TEXT CHECK (semester IN ('1', '2', 'both', 'annual')),
  tags TEXT[] DEFAULT '{}',
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT study_resources_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Create study resource ratings table
CREATE TABLE IF NOT EXISTS study_resource_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES study_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(resource_id, user_id)
);

-- =============================================
-- FILE UPLOAD AND STORAGE SYSTEM
-- =============================================

-- Create file uploads tracking table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  public_url TEXT NOT NULL,
  folder TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SEARCH AND ANALYTICS SYSTEM
-- =============================================

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  result_count INTEGER DEFAULT 0,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMPTZ DEFAULT NOW(),
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EMAIL SYSTEM
-- =============================================

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_id TEXT,
  variables JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  message_id TEXT,
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- ADVANCED NOTIFICATIONS
-- =============================================

-- Enhance notifications table with more fields
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create real-time notification channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('in_app', 'email', 'push', 'sms')),
  enabled BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, channel_type)
);

-- =============================================
-- ENHANCED USER PROFILES
-- =============================================

-- Add more fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS student_number TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"notifications": true, "marketing": false, "reminders": true}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "verified_only"}',
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add constraints separately to avoid conflicts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_verification_status_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
    CHECK (verification_status IN ('unverified', 'pending', 'verified'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;
END $$;

-- =============================================
-- ENHANCED ORDERS AND TRANSACTIONS
-- =============================================

-- Add commit system fields to orders (if not exists)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS commit_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seller_committed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS committed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decline_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_reference TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_expired BOOLEAN DEFAULT FALSE;

-- =============================================
-- UNIVERSITY AND COURSE DATA
-- =============================================

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  website TEXT,
  province TEXT,
  city TEXT,
  address TEXT,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  faculty TEXT,
  department TEXT,
  year_level INTEGER CHECK (year_level BETWEEN 1 AND 6),
  credits INTEGER,
  description TEXT,
  prerequisites TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(university_id, code)
);

-- =============================================
-- SYSTEM MONITORING AND HEALTH
-- =============================================

-- Create system health logs table
CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  response_status INTEGER,
  response_time_ms INTEGER,
  request_size BIGINT,
  response_size BIGINT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Study resources indexes
CREATE INDEX IF NOT EXISTS idx_study_resources_university_course ON study_resources(university_id, course_code);
CREATE INDEX IF NOT EXISTS idx_study_resources_type ON study_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_study_resources_verified ON study_resources(is_verified);
CREATE INDEX IF NOT EXISTS idx_study_resources_rating ON study_resources(rating DESC);
CREATE INDEX IF NOT EXISTS idx_study_resources_downloads ON study_resources(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_study_resources_created_by ON study_resources(created_by);
CREATE INDEX IF NOT EXISTS idx_study_resources_tags ON study_resources USING GIN(tags);

-- File uploads indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_folder ON file_uploads(folder);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at DESC);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_count ON search_analytics(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_last_searched ON search_analytics(last_searched DESC);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON notifications(user_id, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Orders indexes for commit system
CREATE INDEX IF NOT EXISTS idx_orders_commit_deadline ON orders(commit_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_seller_committed ON orders(seller_id, seller_committed);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Universities and courses indexes
CREATE INDEX IF NOT EXISTS idx_universities_province ON universities(province);
CREATE INDEX IF NOT EXISTS idx_universities_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_university_code ON courses(university_id, code);
CREATE INDEX IF NOT EXISTS idx_courses_year_level ON courses(year_level);

-- System monitoring indexes
CREATE INDEX IF NOT EXISTS idx_system_health_service ON system_health_logs(service_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Study resources RLS
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verified study resources" ON study_resources
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can view own study resources" ON study_resources
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create study resources" ON study_resources
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own study resources" ON study_resources
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admin can manage all study resources" ON study_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- File uploads RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON file_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Email queue RLS (admin only)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage email queue" ON email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Notification channels RLS
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification channels" ON notification_channels
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Universities RLS (public read, admin write)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are publicly readable" ON universities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage universities" ON universities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Courses RLS (public read, admin write)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are publicly readable" ON courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update study resource rating
CREATE OR REPLACE FUNCTION update_study_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating
  UPDATE study_resources
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM study_resource_ratings
    WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
  )
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for study resource rating updates
DROP TRIGGER IF EXISTS update_study_resource_rating_trigger ON study_resource_ratings;
CREATE TRIGGER update_study_resource_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON study_resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_study_resource_rating();

-- Function to set commit deadline on order payment
CREATE OR REPLACE FUNCTION set_commit_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Set 48-hour deadline when order status becomes 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    NEW.commit_deadline = NOW() + INTERVAL '48 hours';
    NEW.expires_at = NEW.commit_deadline;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for setting commit deadline
DROP TRIGGER IF EXISTS set_commit_deadline_trigger ON orders;
CREATE TRIGGER set_commit_deadline_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_commit_deadline();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_study_resources_updated_at ON study_resources;
CREATE TRIGGER update_study_resources_updated_at
  BEFORE UPDATE ON study_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_file_uploads_updated_at ON file_uploads;
CREATE TRIGGER update_file_uploads_updated_at
  BEFORE UPDATE ON file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_universities_updated_at ON universities;
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default notification channels for existing users
INSERT INTO notification_channels (user_id, channel_type, enabled, settings)
SELECT
  id,
  'in_app',
  true,
  '{"all": true}'::jsonb
FROM profiles
ON CONFLICT (user_id, channel_type) DO NOTHING;

-- Insert some sample universities
INSERT INTO universities (code, name, short_name, province, city) VALUES
('UCT', 'University of Cape Town', 'UCT', 'Western Cape', 'Cape Town'),
('WITS', 'University of the Witwatersrand', 'Wits', 'Gauteng', 'Johannesburg'),
('UP', 'University of Pretoria', 'UP', 'Gauteng', 'Pretoria'),
('UWC', 'University of the Western Cape', 'UWC', 'Western Cape', 'Cape Town'),
('CPUT', 'Cape Peninsula University of Technology', 'CPUT', 'Western Cape', 'Cape Town'),
('TUT', 'Tshwane University of Technology', 'TUT', 'Gauteng', 'Pretoria')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Create view for study resource analytics
CREATE OR REPLACE VIEW study_resource_analytics AS
SELECT
  sr.university_id,
  sr.resource_type,
  COUNT(*) as total_resources,
  AVG(sr.rating) as avg_rating,
  SUM(sr.download_count) as total_downloads,
  COUNT(CASE WHEN sr.is_verified THEN 1 END) as verified_count
FROM study_resources sr
GROUP BY sr.university_id, sr.resource_type;

-- Create view for user activity analytics
CREATE OR REPLACE VIEW user_activity_analytics AS
SELECT
  p.id,
  p.name,
  p.university,
  COUNT(DISTINCT b.id) as books_listed,
  COUNT(DISTINCT o1.id) as books_sold,
  COUNT(DISTINCT o2.id) as books_bought,
  COUNT(DISTINCT sr.id) as resources_shared,
  p.created_at as joined_date,
  p.last_active
FROM profiles p
LEFT JOIN books b ON p.id = b.seller_id
LEFT JOIN orders o1 ON p.id = o1.seller_id AND o1.status = 'completed'
LEFT JOIN orders o2 ON p.id = o2.buyer_id AND o2.status = 'completed'
LEFT JOIN study_resources sr ON p.id = sr.created_by
GROUP BY p.id, p.name, p.university, p.created_at, p.last_active;

-- Grant permissions
GRANT SELECT ON study_resource_analytics TO authenticated;
GRANT SELECT ON user_activity_analytics TO authenticated;

-- Success message
SELECT 'Comprehensive backend features migration completed successfully!' as status;
