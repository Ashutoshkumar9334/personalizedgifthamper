CREATE OR REPLACE FUNCTION public.enforce_customer_order_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
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

DROP TRIGGER IF EXISTS orders_customer_status_guard ON public.orders;
CREATE TRIGGER orders_customer_status_guard
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_customer_order_status();

DROP POLICY IF EXISTS "customers update own order status" ON public.orders;
CREATE POLICY "customers update own order status"
ON public.orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);