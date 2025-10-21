-- Create dashboard_settings table to store user dashboard preferences
CREATE TABLE public.dashboard_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  daily_goal text,
  daily_quote text,
  balance text DEFAULT '₹0.00',
  last_updated text,
  quick_links jsonb DEFAULT '[]'::jsonb,
  search_engine jsonb DEFAULT '{"url": "https://www.google.com/search?q=", "icon": "https://www.google.com/favicon.ico"}'::jsonb,
  theme text DEFAULT 'light',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dashboard_settings
CREATE POLICY "Users can view their own dashboard settings"
  ON public.dashboard_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard settings"
  ON public.dashboard_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings"
  ON public.dashboard_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard settings"
  ON public.dashboard_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_settings_updated_at
  BEFORE UPDATE ON public.dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pages_updated_at();

-- Create function to initialize default dashboard settings for new users
CREATE OR REPLACE FUNCTION public.create_default_dashboard_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dashboard_settings (user_id, theme)
  VALUES (NEW.id, 'light')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to initialize dashboard settings on user creation
CREATE TRIGGER on_user_created_dashboard_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_dashboard_settings();