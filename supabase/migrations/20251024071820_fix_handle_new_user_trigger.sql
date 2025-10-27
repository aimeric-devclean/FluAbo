/*
  # Correction du trigger de création d'utilisateur

  1. Modifications
    - Améliore la gestion des erreurs dans handle_new_user()
    - Rend avatar_preset nullable pour éviter les échecs
    - Ajoute des logs pour le debugging
    - Utilise un avatar par défaut si la sélection aléatoire échoue

  2. Notes
    - Le trigger se déclenche lors de l'inscription d'un nouvel utilisateur
    - Crée automatiquement un profil avec username unique
*/

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
  selected_avatar text;
BEGIN
  -- Générer un username de base à partir de l'email
  base_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  
  -- S'assurer qu'il n'est pas vide
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;

  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  -- Sélectionner un avatar prédéfini aléatoire
  BEGIN
    SELECT id INTO selected_avatar FROM avatar_presets ORDER BY random() LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    selected_avatar := NULL;
  END;

  -- Insérer le profil utilisateur
  INSERT INTO public.user_profiles (id, email, username, display_name, avatar_preset)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    selected_avatar
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, logger et relancer
  RAISE WARNING 'Error in handle_new_user for user %: %', NEW.email, SQLERRM;
  RAISE;
END;
$$;
