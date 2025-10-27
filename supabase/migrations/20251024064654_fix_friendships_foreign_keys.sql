/*
  # Fix friendships foreign keys

  1. Problem
    - friendships table references 'profiles' table
    - But user data is stored in 'user_profiles' table
    - This causes foreign key constraint violations

  2. Changes
    - Drop existing foreign key constraints on friendships table
    - Recreate them to reference user_profiles instead of profiles
    - This allows friend requests to work correctly

  3. Security
    - RLS policies remain unchanged
    - Only updates the foreign key references
*/

-- Drop existing foreign key constraints
ALTER TABLE friendships 
DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;

ALTER TABLE friendships 
DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;

-- Create new foreign key constraints pointing to user_profiles
ALTER TABLE friendships
ADD CONSTRAINT friendships_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

ALTER TABLE friendships
ADD CONSTRAINT friendships_friend_id_fkey 
FOREIGN KEY (friend_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;
