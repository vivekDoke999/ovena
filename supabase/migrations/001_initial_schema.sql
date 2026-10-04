-- OVENA Complete Migration - 001_initial_schema.sql

-- 1. Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 7 enum types
CREATE TYPE user_role AS ENUM ('RENTER', 'HOST', 'ADMIN');
CREATE TYPE property_category AS ENUM ('APARTMENT', 'HOUSE', 'ROOM', 'PG', 'HOSTEL', 'VILLA', 'BUNGALOW', 'COMMERCIAL', 'SHOP', 'OFFICE', 'OTHER');
CREATE TYPE property_status AS ENUM ('AVAILABLE', 'RENTED', 'PAUSED', 'DRAFT');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE furnishing_status AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED');
CREATE TYPE enquiry_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CLOSED');
CREATE TYPE report_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- 3. 9 complete tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'RENTER',
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type property_category NOT NULL,
    rent_amount INTEGER NOT NULL CHECK (rent_amount >= 0),
    deposit_amount INTEGER NOT NULL CHECK (deposit_amount >= 0),
    maintenance_amount INTEGER NOT NULL DEFAULT 0 CHECK (maintenance_amount >= 0),
    maintenance_included BOOLEAN NOT NULL DEFAULT false,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bedrooms INTEGER CHECK (bedrooms >= 0 OR bedrooms IS NULL),
    bathrooms INTEGER CHECK (bathrooms >= 0 OR bathrooms IS NULL),
    area_sqft NUMERIC CHECK (area_sqft > 0 OR area_sqft IS NULL),
    furnishing_status furnishing_status,
    available_from DATE,
    status property_status NOT NULL DEFAULT 'DRAFT',
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.property_amenities (
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status enquiry_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.saved_properties (
    renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (renter_id, property_id)
);

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status report_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. indexes
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_suspended ON public.profiles (is_suspended);
CREATE INDEX idx_properties_host_id ON public.properties (host_id);
CREATE INDEX idx_properties_city ON public.properties (city, locality);
CREATE INDEX idx_properties_status ON public.properties (status);
CREATE INDEX idx_properties_verification ON public.properties (verification_status);
CREATE INDEX idx_property_images_pid ON public.property_images (property_id);
CREATE INDEX idx_enquiries_property_id ON public.enquiries (property_id);
CREATE INDEX idx_enquiries_renter_id ON public.enquiries (renter_id);
CREATE INDEX idx_enquiries_status ON public.enquiries (status);
CREATE INDEX idx_reports_status ON public.reports (status);

-- 6. 4 complete functions
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = check_user_id
        AND role = 'ADMIN'
        AND is_suspended = false
    );
$$;

CREATE OR REPLACE FUNCTION public.is_suspended(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = check_user_id
        AND is_suspended = true
    );
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_enquiry_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.renter_id IS DISTINCT FROM OLD.renter_id THEN
        RAISE EXCEPTION 'Cannot change renter_id after enquiry creation';
    END IF;
    IF NEW.property_id IS DISTINCT FROM OLD.property_id THEN
        RAISE EXCEPTION 'Cannot change property_id after enquiry creation';
    END IF;
    RETURN NEW;
END;
$$;

-- 7. 5 complete triggers
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_enquiry_immutability
BEFORE UPDATE ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION public.enforce_enquiry_immutability();

-- 8. RLS enable statements
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- 9. 29 complete RLS policies

CREATE POLICY profiles_select
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY profiles_insert
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()))
WITH CHECK (
    (auth.uid() = id AND role <> 'ADMIN' AND is_suspended = false)
    OR public.is_admin(auth.uid())
);

CREATE POLICY properties_public_select
ON public.properties
FOR SELECT
TO anon, authenticated
USING (status = 'AVAILABLE' AND verification_status = 'VERIFIED');

CREATE POLICY properties_host_select
ON public.properties
FOR SELECT
TO authenticated
USING (host_id = auth.uid());

CREATE POLICY properties_host_insert
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
    host_id = auth.uid()
    AND public.is_suspended(auth.uid()) = false
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('HOST', 'ADMIN')
    )
);

CREATE POLICY properties_host_update
ON public.properties
FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

CREATE POLICY properties_host_delete
ON public.properties
FOR DELETE
TO authenticated
USING (host_id = auth.uid());

CREATE POLICY properties_admin_all
ON public.properties
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY property_images_public_select
ON public.property_images
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_images.property_id
        AND status = 'AVAILABLE'
        AND verification_status = 'VERIFIED'
    )
);

CREATE POLICY property_images_host_all
ON public.property_images
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_images.property_id
        AND host_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_images.property_id
        AND host_id = auth.uid()
    )
);

CREATE POLICY property_images_admin_all
ON public.property_images
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY amenities_public_select
ON public.amenities
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY amenities_admin_all
ON public.amenities
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY property_amenities_public_select
ON public.property_amenities
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_amenities.property_id
        AND status = 'AVAILABLE'
        AND verification_status = 'VERIFIED'
    )
);

CREATE POLICY property_amenities_host_all
ON public.property_amenities
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_amenities.property_id
        AND host_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_amenities.property_id
        AND host_id = auth.uid()
    )
);

CREATE POLICY property_amenities_admin_all
ON public.property_amenities
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY enquiries_select
ON public.enquiries
FOR SELECT
TO authenticated
USING (
    renter_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = enquiries.property_id AND host_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY enquiries_insert
ON public.enquiries
FOR INSERT
TO authenticated
WITH CHECK (
    renter_id = auth.uid()
    AND public.is_suspended(auth.uid()) = false
);

CREATE POLICY enquiries_update
ON public.enquiries
FOR UPDATE
TO authenticated
USING (
    renter_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = enquiries.property_id AND host_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
)
WITH CHECK (
    renter_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = enquiries.property_id AND host_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY enquiries_delete
ON public.enquiries
FOR DELETE
TO authenticated
USING (
    renter_id = auth.uid()
    OR public.is_admin(auth.uid())
);

CREATE POLICY saved_properties_select
ON public.saved_properties
FOR SELECT
TO authenticated
USING (renter_id = auth.uid());

CREATE POLICY saved_properties_insert
ON public.saved_properties
FOR INSERT
TO authenticated
WITH CHECK (renter_id = auth.uid());

CREATE POLICY saved_properties_delete
ON public.saved_properties
FOR DELETE
TO authenticated
USING (renter_id = auth.uid());

CREATE POLICY reports_insert
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
    reporter_id = auth.uid()
    AND public.is_suspended(auth.uid()) = false
);

CREATE POLICY reports_admin_select
ON public.reports
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY reports_admin_update
ON public.reports
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY reports_admin_delete
ON public.reports
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY admin_actions_admin
ON public.admin_actions
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
