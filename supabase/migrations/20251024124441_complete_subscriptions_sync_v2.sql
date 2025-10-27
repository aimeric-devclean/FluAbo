/*
  # Compléter la table subscriptions pour synchronisation complète - v2

  1. Modifications
    - Ajouter colonnes manquantes de manière sécurisée
    - Ajouter trigger pour updated_at
    - Mettre à jour les contraintes

  2. Note
    - Cette migration est idempotente (peut être exécutée plusieurs fois)
*/

-- Ajouter currency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'currency'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN currency text NOT NULL DEFAULT 'EUR';
  END IF;
END $$;

-- Renommer is_shared en familial si nécessaire
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'is_shared'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'familial'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN is_shared TO familial;
  END IF;
END $$;

-- Ajouter familial si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'familial'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN familial boolean DEFAULT false;
  END IF;
END $$;

-- Ajouter participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'participants'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN participants jsonb;
  END IF;
END $$;

-- Ajouter shares
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'shares'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN shares jsonb;
  END IF;
END $$;

-- Ajouter rotation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'rotation'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN rotation jsonb;
  END IF;
END $$;

-- Ajouter history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'history'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN history jsonb;
  END IF;
END $$;

-- Mettre à jour constraint billing
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_check 
  CHECK (billing = ANY (ARRAY['weekly'::text, 'monthly'::text, 'annual'::text, 'yearly'::text]));

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_timestamp();

-- Index
CREATE INDEX IF NOT EXISTS idx_subs_owner ON subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_subs_next_charge ON subscriptions(next_charge);
CREATE INDEX IF NOT EXISTS idx_subs_familial ON subscriptions(familial) WHERE familial = true;
