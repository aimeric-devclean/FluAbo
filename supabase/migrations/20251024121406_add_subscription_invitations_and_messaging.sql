/*
  # Système d'invitations aux abonnements familiaux et messagerie

  1. Nouvelles Tables
    - `subscription_invitations`
      - `id` (uuid, primary key)
      - `subscription_id` (text, référence vers abonnement local)
      - `inviter_id` (uuid, user qui invite)
      - `invited_user_id` (uuid, user invité)
      - `status` (pending, accepted, rejected)
      - `created_at` (timestamptz)
      - `responded_at` (timestamptz, nullable)
    
    - `friend_messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, utilisateur qui envoie)
      - `receiver_id` (uuid, utilisateur qui reçoit)
      - `subscription_id` (text, nullable - si message lié à un abonnement)
      - `message` (text, contenu du message)
      - `message_type` (text: 'payment_reminder', 'general', 'invitation')
      - `read` (boolean, défaut false)
      - `created_at` (timestamptz)
    
    - `subscription_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, utilisateur concerné)
      - `subscription_id` (text, abonnement concerné)
      - `notification_type` (text: 'week_before', 'three_days_before', 'day_of')
      - `notification_date` (timestamptz, date de la notification)
      - `sent` (boolean, défaut false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Table des invitations aux abonnements familiaux
CREATE TABLE IF NOT EXISTS subscription_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id text NOT NULL,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

ALTER TABLE subscription_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invitations"
  ON subscription_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations"
  ON subscription_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their received invitations"
  ON subscription_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = invited_user_id)
  WITH CHECK (auth.uid() = invited_user_id);

CREATE POLICY "Users can delete their sent invitations"
  ON subscription_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Table de messagerie entre amis
CREATE TABLE IF NOT EXISTS friend_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'general' CHECK (message_type IN ('payment_reminder', 'general', 'invitation')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE friend_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON friend_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON friend_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON friend_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their sent messages"
  ON friend_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Table des notifications planifiées pour les abonnements
CREATE TABLE IF NOT EXISTS subscription_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('week_before', 'three_days_before', 'day_of')),
  notification_date timestamptz NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON subscription_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
  ON subscription_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON subscription_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON subscription_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscription_invitations_invited ON subscription_invitations(invited_user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscription_invitations_inviter ON subscription_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_friend_messages_receiver ON friend_messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_friend_messages_sender ON friend_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_user ON subscription_notifications(user_id, sent, notification_date);
