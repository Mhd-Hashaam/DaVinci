-- =============================================================
-- Create Profiles on Signup Trigger
-- =============================================================

-- 1. Create the function that inserts a row into the public.profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    -- Attempt to get a username from raw_user_meta_data, fallback to email prefix, fallback to 'user_' + random auth id
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    -- Full name from Google/OAuth metadata
    NEW.raw_user_meta_data->>'full_name',
    -- Avatar from Google/OAuth metadata
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    -- Default role
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
