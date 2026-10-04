-- Drop existing trigger/function if they exist to be safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function securely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  parsed_role text;
BEGIN
  parsed_role := new.raw_user_meta_data->>'role';
  
  -- Fallback and sanitize role
  IF parsed_role NOT IN ('RENTER', 'HOST') THEN
    parsed_role := 'RENTER';
  END IF;

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone,
    role
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    parsed_role
  );
  RETURN new;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
