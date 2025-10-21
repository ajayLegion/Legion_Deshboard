-- Create function to initialize a dashboard page for new users
CREATE OR REPLACE FUNCTION public.create_default_dashboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pages (user_id, title, content, parent_id, order_index)
  VALUES (
    NEW.id,
    'Dashboard',
    '<h1>Welcome to Legion Notes</h1><p>This is your personal dashboard. Start creating pages to organize your notes!</p>',
    NULL,
    0
  );
  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
CREATE TRIGGER on_user_created_dashboard
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_dashboard();