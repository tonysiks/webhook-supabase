CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  plan text CHECK (plan IN ('starter_mensuel', 'starter_annuel', 'business')),
  status text CHECK (status IN ('active', 'inactive', 'canceled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
