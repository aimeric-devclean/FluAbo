/*
  # Ajout de la suppression en cascade de auth.users

  1. Fonction
    - Supprime automatiquement l'utilisateur de auth.users quand son profil est supprimé de user_profiles

  2. Trigger
    - Se déclenche APRÈS la suppression d'un user_profile
    - Supprime l'utilisateur correspondant de auth.users

  3. Notes importantes
    - Permet de supprimer un compte en supprimant simplement le profil
    - Assure la cohérence entre user_profiles et auth.users
*/

-- Fonction pour supprimer l'utilisateur de auth.users
CREATE OR REPLACE FUNCTION delete_auth_user_on_profile_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprimer l'utilisateur de auth.users
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_user_profile_deleted ON user_profiles;

-- Créer le trigger
CREATE TRIGGER on_user_profile_deleted
  AFTER DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_profile_delete();
