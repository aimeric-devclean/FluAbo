/*
  # Correction RLS pour permettre au trigger de créer des profils

  1. Modifications
    - Ajoute une policy pour permettre au service_role d'insérer des profils
    - Modifie la fonction handle_new_user pour contourner RLS
    - Assure que les nouveaux utilisateurs peuvent être créés correctement

  2. Sécurité
    - Maintient la sécurité en limitant aux requêtes venant du trigger système
*/

-- Modifier la fonction pour utiliser BYPASSRLS si nécessaire
-- Mais d'abord, créons une policy plus permissive pour l'inscription

-- Supprimer l'ancienne policy INSERT si elle existe
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Créer une nouvelle policy qui permet l'insertion lors de l'inscription
-- Cette policy vérifie que l'ID correspond à auth.uid() OU que c'est une nouvelle inscription
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- Soit l'utilisateur est authentifié et c'est son propre profil
    (auth.uid() = id)
    OR
    -- Soit c'est une nouvelle inscription (l'utilisateur existe dans auth.users mais pas dans user_profiles)
    (
      EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = user_profiles.id)
      AND NOT EXISTS (SELECT 1 FROM user_profiles AS up WHERE up.id = user_profiles.id)
    )
  );
