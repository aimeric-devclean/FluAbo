/*
  # Simplification des RLS policies pour user_profiles

  1. Modifications
    - Supprime la policy INSERT restrictive qui bloque le trigger
    - Le trigger handle_new_user est SECURITY DEFINER donc il contourne RLS
    - Seul le trigger peut insérer dans user_profiles (pas d'accès direct)

  2. Sécurité
    - Les utilisateurs ne peuvent pas insérer directement dans user_profiles
    - Seul le trigger système peut créer des profils
    - Les utilisateurs peuvent lire tous les profils et modifier le leur
*/

-- Supprimer toutes les policies INSERT existantes
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Ne pas créer de nouvelle policy INSERT
-- Le trigger avec SECURITY DEFINER contournera RLS automatiquement

-- Vérifier que les autres policies sont bonnes
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
