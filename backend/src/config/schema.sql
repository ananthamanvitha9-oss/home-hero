-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (with geography support for GPS locations)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    location_lat_long GEOGRAPHY(Point, 4326),
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
    meta_details JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate Core Services
INSERT INTO services (name, description) VALUES
('Cleaning', 'Deep household cleaning, sanitization, and organization services'),
('General Handyman', 'Furniture assembly, mounting, drilling, and minor repairs'),
('Plumbing', 'Faucet installations, pipe repairs, and leak management'),
('Electrical', 'Light switch fittings, wiring diagnostic, and appliance configurations')
ON CONFLICT (name) DO NOTHING;

-- 4. Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    dynamic_modifiers JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate Initial Pricing Rules
INSERT INTO pricing_rules (service_id, base_price, hourly_rate, dynamic_modifiers)
SELECT id, 50.00, 25.00, '{"multiplier_per_room": 1.2, "pet_surcharge": 15.00}'::jsonb
FROM services WHERE name = 'Cleaning'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (service_id, base_price, hourly_rate, dynamic_modifiers)
SELECT id, 60.00, 35.00, '{"multiplier_complex_mounting": 1.5}'::jsonb
FROM services WHERE name = 'General Handyman'
ON CONFLICT DO NOTHING;

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID REFERENCES users(id),
    service_id UUID NOT NULL REFERENCES services(id),
    status VARCHAR(25) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'en_route', 'active', 'completed', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL,
    platform_commission NUMERIC(10,2) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Dispatches Table
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'declined', 'timeout')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Transactions Table (Stripe Escrow Integration Log)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_transfer_id VARCHAR(255) UNIQUE,
    gross_amount NUMERIC(10,2) NOT NULL,
    net_to_provider NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'held_in_escrow' CHECK (status IN ('held_in_escrow', 'released', 'refunded', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Subscriptions Table (Hero+ Program)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    plan_status VARCHAR(20) NOT NULL CHECK (plan_status IN ('active', 'trialing', 'cancelled', 'past_due')),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST (location_lat_long);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_location ON bookings USING GIST (service_location);
