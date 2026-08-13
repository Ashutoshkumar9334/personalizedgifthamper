CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- user_roles
DROP POLICY "own roles select" ON public.user_roles;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- orders
DROP POLICY "orders select" ON public.orders;
CREATE POLICY "orders select" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "orders update" ON public.orders;
CREATE POLICY "orders update" ON public.orders FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- vendors
DROP POLICY "own vendor select" ON public.vendors;
CREATE POLICY "own vendor select" ON public.vendors FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "own vendor update" ON public.vendors;
CREATE POLICY "own vendor update" ON public.vendors FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

-- products
DROP POLICY "products select signed in" ON public.products;
CREATE POLICY "products select signed in" ON public.products FOR SELECT TO authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin')
    OR vendor_id IN (SELECT vendors.id FROM public.vendors WHERE vendors.user_id = auth.uid()));
DROP POLICY "admins manage products" ON public.products;
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY "admins select all profiles" ON public.profiles;
CREATE POLICY "admins select all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "admins update all profiles" ON public.profiles;
CREATE POLICY "admins update all profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- categories
DROP POLICY "categories select signed in" ON public.categories;
CREATE POLICY "categories select signed in" ON public.categories FOR SELECT TO authenticated
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "admins manage categories" ON public.categories;
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- notifications
DROP POLICY "own notifications select" ON public.notifications;
CREATE POLICY "own notifications select" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "admins send notifications" ON public.notifications;
CREATE POLICY "admins send notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "admins delete notifications" ON public.notifications;
CREATE POLICY "admins delete notifications" ON public.notifications FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- trigger function
CREATE OR REPLACE FUNCTION public.enforce_customer_order_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (NEW.status = 'cancelled' AND OLD.status IN ('placed','packing'))
      OR (NEW.status = 'return_requested' AND OLD.status = 'delivered')
    ) THEN
      RAISE EXCEPTION 'This order can no longer be changed.';
    END IF;
  END IF;
  NEW.recipient_name := OLD.recipient_name;
  NEW.recipient_phone := OLD.recipient_phone;
  NEW.address_line1 := OLD.address_line1;
  NEW.city := OLD.city;
  NEW.postal_code := OLD.postal_code;
  NEW.items := OLD.items;
  NEW.subtotal := OLD.subtotal;
  NEW.total := OLD.total;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
