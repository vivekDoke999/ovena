-- 003_host_security.sql
-- Create a trigger to prevent non-admins from modifying sensitive property columns
CREATE OR REPLACE FUNCTION public.enforce_property_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the current user is NOT an admin
    IF NOT public.is_admin(auth.uid()) THEN
        -- If verification_status was changed by a non-admin, raise an exception
        IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
            RAISE EXCEPTION 'Unauthorized: Only admins can modify verification_status';
        END IF;

        -- If status is changed to AVAILABLE by a non-admin, prevent it if verification_status is not VERIFIED.
        -- Hosts cannot bypass moderation by forcing status to AVAILABLE.
        IF NEW.status = 'AVAILABLE' AND OLD.status IS DISTINCT FROM 'AVAILABLE' THEN
            IF OLD.verification_status != 'VERIFIED' THEN
                 RAISE EXCEPTION 'Unauthorized: Cannot set status to AVAILABLE unless property is VERIFIED';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_property_security ON public.properties;
CREATE TRIGGER trg_enforce_property_security
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_security();

-- Also ensure a Host cannot insert a property with verification_status != 'PENDING'
CREATE OR REPLACE FUNCTION public.enforce_property_insert_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        IF NEW.verification_status != 'PENDING' THEN
            -- Force it to PENDING for non-admins
            NEW.verification_status = 'PENDING';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_property_insert_security ON public.properties;
CREATE TRIGGER trg_enforce_property_insert_security
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_insert_security();
