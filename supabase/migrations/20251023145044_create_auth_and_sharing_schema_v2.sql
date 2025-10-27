/*
  # Authentication & Social Sharing Schema

  ## Overview
  Complete schema for user authentication and social subscription sharing.
  Users can connect via Apple/Google OAuth and share subscriptions with friends/family.

  ## New Tables

  ### `profiles`
  - User profiles linked to auth.users
  - Basic info: email, display_name, avatar

  ### `subscriptions`
  - User subscriptions with sharing capabilities
  - Supports rotation and shared payment modes

  ### `subscription_participants`
  - Links users to shared subscriptions
  - Tracks rotation order for turn-based payments

  ### `friendships`
  - Social connections between users
  - Supports pending/accepted/blocked states

  ### `subscription_history`
  - Payment history tracking
  - Records who paid and when

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data and shared content
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create friendships table (before profiles policies that reference it)
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view friends' profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = profiles.id AND friendships.status = 'accepted')
         OR (friendships.friend_id = auth.uid() AND friendships.user_id = profiles.id AND friendships.status = 'accepted')
    )
  );

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider_id text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  billing text NOT NULL CHECK (billing IN ('monthly', 'yearly', 'weekly')),
  next_charge date NOT NULL,
  is_paused boolean DEFAULT false,
  is_shared boolean DEFAULT false,
  payment_mode text CHECK (payment_mode IN ('rotation', 'shared')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create subscription_participants table
CREATE TABLE IF NOT EXISTS subscription_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'participant')),
  rotation_order integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(subscription_id, user_id)
);

ALTER TABLE subscription_participants ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscription_participants
      WHERE subscription_participants.subscription_id = subscriptions.id
        AND subscription_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Subscription participants policies
CREATE POLICY "Users can view own participations"
  ON subscription_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view participations of their subscriptions"
  ON subscription_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_participants.subscription_id
        AND subscriptions.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert participants"
  ON subscription_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_id
        AND subscriptions.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete participants"
  ON subscription_participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_participants.subscription_id
        AND subscriptions.owner_id = auth.uid()
    )
  );

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update received friend requests"
  ON friendships FOR UPDATE
  TO authenticated
  USING (friend_id = auth.uid())
  WITH CHECK (friend_id = auth.uid());

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of their subscriptions"
  ON subscription_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_history.subscription_id
        AND (subscriptions.owner_id = auth.uid() OR EXISTS (
          SELECT 1 FROM subscription_participants
          WHERE subscription_participants.subscription_id = subscriptions.id
            AND subscription_participants.user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "Users can insert history for their subscriptions"
  ON subscription_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_id
        AND (subscriptions.owner_id = auth.uid() OR EXISTS (
          SELECT 1 FROM subscription_participants
          WHERE subscription_participants.subscription_id = subscriptions.id
            AND subscription_participants.user_id = auth.uid()
        ))
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscription_participants_user ON subscription_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_participants_subscription ON subscription_participants(subscription_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
