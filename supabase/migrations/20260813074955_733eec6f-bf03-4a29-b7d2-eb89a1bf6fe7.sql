-- COUPONS
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "coupons select active" ON public.coupons FOR SELECT TO authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER coupons_set_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  title text,
  body text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public approved reviews" ON public.reviews FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "reviews select signed in" ON public.reviews FOR SELECT TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "own review insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  link_url text,
  placement text NOT NULL DEFAULT 'home_hero',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT SELECT ON public.banners TO anon;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public banners select" ON public.banners FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "banners select signed in" ON public.banners FOR SELECT TO authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage banners" ON public.banners FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER banners_set_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BLOG POSTS
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text,
  cover_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public blog select" ON public.blog_posts FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "blog select signed in" ON public.blog_posts FOR SELECT TO authenticated
  USING (is_published = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage blog" ON public.blog_posts FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();