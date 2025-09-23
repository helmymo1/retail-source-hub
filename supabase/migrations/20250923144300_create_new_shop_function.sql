CREATE OR REPLACE FUNCTION public.create_new_shop(
  shop_name TEXT,
  shop_location TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID := auth.uid();
BEGIN
  -- Insert into shops table
  INSERT INTO public.shops (owner_id, name, location)
  VALUES (new_user_id, shop_name, shop_location);

  -- Assign business_owner role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'business_owner');
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_new_shop(TEXT, TEXT) TO authenticated;
