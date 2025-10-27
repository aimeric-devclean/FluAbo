/*
  # Ajout du flag d'onboarding

  1. Modifications
    - Ajoute la colonne `has_completed_onboarding` dans user_profiles
    - Par défaut à `false` pour les nouveaux utilisateurs
    - Permet de savoir si l'utilisateur a terminé la configuration initiale

  2. Sécurité
    - Les utilisateurs peuvent mettre à jour leur propre flag d'onboarding
*/

-- Ajouter la colonne has_completed_onboarding
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean DEFAULT false;

-- Mettre à jour les utilisateurs existants pour qu'ils n'aient pas à refaire l'onboarding
UPDATE user_profiles
SET has_completed_onboarding = true
WHERE has_completed_onboarding IS NULL;
