-- Billbuddy Supabase Schema
-- Run these SQL commands in Supabase SQL Editor

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON profiles(username);

-- 2. Create rooms table (expense sharing groups)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name TEXT NOT NULL,
  pin_code VARCHAR(6) NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  payment_due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMP WITH TIME ZONE;

-- 3. Create room_members table (users in rooms)
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  has_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- 3b. Create groups table (subgroups inside rooms)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3c. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- 4. Create expenses table (individual transactions)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  paid_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create expense_splits table (how expense is split among room members)
CREATE TABLE IF NOT EXISTS expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  split_amount DECIMAL(10, 2) NOT NULL,
  UNIQUE(expense_id, user_id)
);

-- 6. Create friend_requests table (friend system)
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (sender_id <> receiver_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_pin_code ON rooms(pin_code);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_room_id ON groups(room_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_room_id ON expenses(room_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_unique_pair
  ON friend_requests (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rooms table
CREATE POLICY "Users can view rooms they are members of" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = rooms.id 
      AND room_members.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can lookup rooms by pin" ON rooms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creator can update room" ON rooms
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for room_members table
DROP POLICY IF EXISTS "Users can view room members for rooms they are in" ON room_members;
CREATE POLICY "Users can view room members for rooms they are in" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join rooms" ON room_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON room_members
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for groups table
CREATE POLICY "Users can view groups in their rooms" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = groups.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups in their rooms" ON groups
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = groups.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- RLS Policies for group_members table
CREATE POLICY "Users can view group members in their rooms" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups
      JOIN room_members ON room_members.room_id = groups.room_id
      WHERE groups.id = group_members.group_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to groups in their rooms" ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      JOIN room_members ON room_members.room_id = groups.room_id
      WHERE groups.id = group_members.group_id
      AND room_members.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM groups
      JOIN room_members rm2 ON rm2.room_id = groups.room_id
      WHERE groups.id = group_members.group_id
      AND rm2.user_id = group_members.user_id
    )
  );

-- RLS Policies for expenses table
CREATE POLICY "Users can view expenses in their rooms" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = expenses.room_id 
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses in their rooms" ON expenses
  FOR INSERT WITH CHECK (
    paid_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = expenses.room_id 
      AND room_members.user_id = auth.uid()
    )
  );

-- RLS Policies for expense_splits table
CREATE POLICY "Users can view expense splits in their rooms" ON expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses
      JOIN room_members ON room_members.room_id = expenses.room_id
      WHERE expenses.id = expense_splits.expense_id
      AND room_members.user_id = auth.uid()
    )
  );

-- RLS Policies for friend_requests table
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND receiver_id <> auth.uid());

CREATE POLICY "Users can update received requests" ON friend_requests
  FOR UPDATE USING (receiver_id = auth.uid());

-- Utility to generate unique usernames
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_text TEXT)
RETURNS TEXT AS $$
DECLARE
  cleaned TEXT;
  candidate TEXT;
  suffix INT := 0;
BEGIN
  cleaned := LOWER(REGEXP_REPLACE(COALESCE(base_text, 'user'), '[^a-z0-9_]', '_', 'g'));
  cleaned := TRIM(BOTH '_' FROM cleaned);
  IF cleaned = '' THEN
    cleaned := 'user';
  END IF;

  candidate := LEFT(cleaned, 20);

  WHILE EXISTS (SELECT 1 FROM public.profiles p WHERE p.username = candidate) LOOP
    suffix := suffix + 1;
    candidate := LEFT(cleaned, 17) || '_' || suffix::TEXT;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on signup (optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, username, display_name, email)
    VALUES (
      NEW.id,
      NULL,
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email
    );
  EXCEPTION WHEN OTHERS THEN
    -- Never block signup if profile insert fails (constraints, RLS, etc.)
    RETURN NEW;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to call handle_new_user on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
