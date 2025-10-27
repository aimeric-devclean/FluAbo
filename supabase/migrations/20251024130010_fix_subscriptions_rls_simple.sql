/*
  # Simplifier les RLS policies pour subscriptions

  1. Problème
    - Les policies utilisent auth.uid() mais owner_id référence profiles
    - Il faut que owner_id référence directement auth.users

  2. Solution
    - Supprimer la foreign key vers profiles
    - Ajouter foreign key vers auth.users
    - Les policies sont déjà correctes avec auth.uid()

  3. Note
    - Cette migration est idempotente
*/

-- Supprimer l'ancienne contrainte vers profiles si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subscriptions_owner_id_fkey'
    AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_owner_id_fkey;
  END IF;
END $$;

-- Ajouter la nouvelle contrainte vers auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subscriptions_owner_id_auth_fkey'
    AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions 
    ADD CONSTRAINT subscriptions_owner_id_auth_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Les policies existantes sont déjà correctes car elles utilisent auth.uid()
-- Pas besoin de les modifier
