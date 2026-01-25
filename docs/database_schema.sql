-- Database Schema for QuikFixx (PostgreSQL + PostGIS)
-- Goal: Supports Users, Providers (with Geospatial data), and Orders.

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Users Table (Customers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Service Categories (Normalization)
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'Electrician', 'Plumber'
    description TEXT
);

-- 4. Providers Table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- Link to generic user auth
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Geospatial Location: Point(Longitude, Latitude) in WGS 84 (SRID 4326)
    current_location GEOGRAPHY(POINT, 4326),
    
    -- Array of skill tags or link to categories. For simplicity, using array of category IDs or Strings.
    -- Better design: Many-to-Many table. For now, simple textual tags + JSONB for flexibility.
    skill_tags TEXT[], -- e.g. ['wiring', 'installation']
    
    rating DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Provider Skills (Many-to-Many for rigorous filtering)
CREATE TABLE provider_services (
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES service_categories(id),
    PRIMARY KEY (provider_id, category_id)
);

-- 6. Orders / Bookings Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID REFERENCES providers(id), -- Nullable initially until accepted
    
    service_category_id INTEGER REFERENCES service_categories(id),
    
    -- Status Workflow: PENDING -> ACCEPTED -> ARRIVED -> IN_PROGRESS -> COMPLETED
    -- Or: CANCELLED
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    
    -- Locations
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_geo GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)) STORED,
    
    scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- For "On-Demand", this is NOW()
    
    price_estimated DECIMAL(10, 2),
    price_final DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indexes for Performance (CRITICAL)

-- Spatial Index on Provider Location for fast KNN (k-nearest neighbors) and Radius queries
CREATE INDEX idx_providers_location ON providers USING GIST (current_location);

-- Spatial Index on Order Location (for analytics / clustering)
CREATE INDEX idx_orders_location ON orders USING GIST (location_geo);

-- Standard Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_provider ON orders(provider_id);
CREATE INDEX idx_orders_status ON orders(status); -- vital for filtering 'PENDING' orders
CREATE INDEX idx_providers_online ON providers(is_online) WHERE is_online = TRUE; -- Partial index for active drivers

-- Combined Index for Dispatch Engine (Find online providers in relevant category)
-- Note: GIST on location is usually enough, but filtering by Service Category first is common.
-- Complex query: Select from providers where category = X AND ST_DWithin(location, Y, R)
