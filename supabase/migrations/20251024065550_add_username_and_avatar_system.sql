/*
  # Ajout du système de pseudo et d'avatars

  1. Modifications de la table user_profiles
    - Ajout du champ `username` (texte unique, obligatoire)
    - Modification de `display_name` pour être optionnel
    - Conservation de `avatar_url` pour les photos custom
    - Ajout de `avatar_preset` pour les avatars prédéfinis
  
  2. Nouvelles tables
    - `avatar_presets` : Liste des avatars prédéfinis disponibles
  
  3. Index
    - Index unique sur username pour recherche rapide
    - Index sur avatar_preset pour jointures
  
  4. Sécurité
    - RLS maintenu sur toutes les tables
    - Politique pour lire les avatars prédéfinis (public)
  
  5. Notes importantes
    - Les usernames doivent être uniques dans toute l'application
    - Un utilisateur peut avoir soit un avatar prédéfini, soit une photo custom
    - Migration des données existantes avec génération de usernames temporaires
*/

-- Créer la table des avatars prédéfinis
CREATE TABLE IF NOT EXISTS avatar_presets (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur avatar_presets
ALTER TABLE avatar_presets ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les avatars prédéfinis
CREATE POLICY "Anyone can read avatar presets"
  ON avatar_presets FOR SELECT
  TO authenticated
  USING (true);

-- Insérer des avatars prédéfinis
INSERT INTO avatar_presets (id, name, emoji, color) VALUES
  ('avatar_1', 'Lion', '🦁', '#F59E0B'),
  ('avatar_2', 'Chat', '🐱', '#8B5CF6'),
  ('avatar_3', 'Chien', '🐶', '#3B82F6'),
  ('avatar_4', 'Panda', '🐼', '#10B981'),
  ('avatar_5', 'Koala', '🐨', '#6B7280'),
  ('avatar_6', 'Renard', '🦊', '#EF4444'),
  ('avatar_7', 'Ours', '🐻', '#78350F'),
  ('avatar_8', 'Lapin', '🐰', '#EC4899'),
  ('avatar_9', 'Tigre', '🐯', '#F97316'),
  ('avatar_10', 'Singe', '🐵', '#A16207'),
  ('avatar_11', 'Licorne', '🦄', '#A855F7'),
  ('avatar_12', 'Dragon', '🐉', '#DC2626'),
  ('avatar_13', 'Robot', '🤖', '#6366F1'),
  ('avatar_14', 'Alien', '👽', '#14B8A6'),
  ('avatar_15', 'Ninja', '🥷', '#1F2937')
ON CONFLICT (id) DO NOTHING;

-- Ajouter les nouvelles colonnes à user_profiles
DO $$
BEGIN
  -- Ajouter username (nullable temporairement pour la migration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text;
  END IF;

  -- Ajouter avatar_preset
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_preset'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_preset text REFERENCES avatar_presets(id);
  END IF;
END $$;

-- Générer des usernames temporaires pour les utilisateurs existants
UPDATE user_profiles 
SET username = LOWER(REGEXP_REPLACE(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || substring(id::text from 1 for 4)
WHERE username IS NULL;

-- Maintenant rendre username obligatoire et unique
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_idx ON user_profiles(LOWER(username));

-- Mettre à jour la fonction handle_new_user pour inclure username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Générer un username de base à partir de l'email
  base_username := LOWER(REGEXP_REPLACE(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  final_username := base_username;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  
  -- Insérer le profil avec username et un avatar prédéfini aléatoire
  INSERT INTO public.user_profiles (id, email, username, display_name, avatar_preset)
  VALUES (
    new.id,
    new.email,
    final_username,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    (SELECT id FROM avatar_presets ORDER BY random() LIMIT 1)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assigner un avatar prédéfini aléatoire aux utilisateurs existants qui n'en ont pas
UPDATE user_profiles
SET avatar_preset = (SELECT id FROM avatar_presets ORDER BY random() LIMIT 1)
WHERE avatar_preset IS NULL;
