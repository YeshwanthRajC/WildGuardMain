-- SQL Schema for Wildlife Conflict Markers & Records Management

-- 1. Create table for Conflict Map Cases
CREATE TABLE IF NOT EXISTS public.conflict_map_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    threat_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for Manual Records
CREATE TABLE IF NOT EXISTS public.manual_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    threat_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In a production environment, you should also apply Row Level Security (RLS) policies 
-- depending on your authentication setup. For now, this creates the necessary tables.

-- Fix for "permission denied" errors: Disable Row Level Security (RLS) for testing.
-- If you prefer RLS enabled, you can create a policy: CREATE POLICY "Allow all" ON public.conflict_map_cases FOR ALL USING (true);
ALTER TABLE public.conflict_map_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_records DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles (standard for Supabase REST APIs)
GRANT ALL ON TABLE public.conflict_map_cases TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.manual_records TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- NEW SCHEMA: Edge Device Management & Intelligent Alert System
-- -----------------------------------------------------------------------------

-- 3. Create table for Edge Devices
CREATE TABLE IF NOT EXISTS public.edge_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    mqtt_broker VARCHAR(255) NOT NULL,
    mqtt_port INTEGER NOT NULL,
    mqtt_topic VARCHAR(255) NOT NULL,
    last_service_date DATE,
    next_service_date DATE,
    status VARCHAR(50) DEFAULT 'Unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Unified Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(100) NOT NULL, -- e.g., 'WILDLIFE_ALERT', 'MAINTENANCE_ALERT'
    device_id UUID REFERENCES public.edge_devices(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    location VARCHAR(255),
    message TEXT NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE,
    received_time TIME DEFAULT CURRENT_TIME,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix for "permission denied" errors on new tables
ALTER TABLE public.edge_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.edge_devices TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
