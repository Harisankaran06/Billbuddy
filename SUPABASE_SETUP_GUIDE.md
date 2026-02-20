# Supabase Setup Guide for BillBuddy

Complete these steps to enable all features (groups, expenses, balances, phone calls).

---

## Step 1: Run SQL Schema

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy the **entire contents** of `SUPABASE_SCHEMA.sql`
5. Paste into the SQL Editor
6. Click **"Run"**

✅ **Expected Result:** All tables created successfully (profiles, rooms, room_members, groups, group_members, expenses, expense_splits, friend_requests)

---

## Step 2: Create Storage Bucket for Receipts

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Enter bucket details:
   - **Name:** `receipts`
   - **Public bucket:** ✅ **ENABLED** (must be checked so receipt URLs work)
4. Click **"Create bucket"**

### Set Bucket Policies (Important!)

After creating the bucket, click on it and go to **Policies** tab:

1. Click **"New policy"**
2. Select **"For full customization"**
3. Create this policy:

**Policy 1: Allow authenticated users to upload receipts**
```sql
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM rooms
    WHERE created_by = auth.uid()
  )
);
```

**Policy 2: Allow anyone to view receipts (public bucket)**
```sql
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
```

✅ **Expected Result:** Receipts can be uploaded when creating rooms and viewed publicly

---

## Step 3: Verify Database Tables

Run this query in SQL Editor to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles',
  'rooms', 
  'room_members',
  'groups',
  'group_members',
  'expenses',
  'expense_splits',
  'friend_requests'
)
ORDER BY table_name;
```

You should see **8 tables** listed.

---

## Step 4: Test Features

### Test 1: Create Room
1. Run `npm start` in terminal
2. Sign up / Log in
3. Click **"Create Room"**
4. Fill in room details and take a receipt photo
5. ✅ Room should be created with PIN code

### Test 2: Join Room
1. Open app in another browser/incognito window
2. Sign up with different email
3. Click **"Join Room"** and enter the PIN
4. ✅ Should join successfully

### Test 3: Add Expense
1. In room view, click **"Add Expense"**
2. Fill in description, amount, category
3. Click **"Save Expense"**
4. ✅ Should see expense in "Recent Expenses" card
5. ✅ Should see balances update in "Member Balances" card

### Test 4: Create Group
1. Click **"Create Group"** button
2. Enter group name
3. Select members (you're auto-selected)
4. Click **"Create Group"**
5. ✅ Should see group in "Groups" card

### Test 5: Phone Call (if phone numbers added)
1. Add phone numbers to user profiles in Supabase
2. ✅ Should see phone icon next to members in sidebar
3. Click phone icon to initiate call

---

## Common Issues

### Issue: "permission denied for table groups"
**Solution:** Make sure you ran the entire SQL schema including the RLS policies

### Issue: "Failed to upload receipt"
**Solution:** 
1. Verify the `receipts` bucket exists and is **public**
2. Check bucket policies are created
3. Make sure you're signed in

### Issue: "No balances showing"
**Solution:** 
1. Make sure expenses table has data
2. Check expense_splits table is populated
3. Verify RLS policies allow SELECT on both tables

### Issue: "Groups not showing"
**Solution:**
1. Run this query to check if groups tables exist:
   ```sql
   SELECT * FROM groups;
   SELECT * FROM group_members;
   ```
2. If tables don't exist, re-run the schema SQL

---

## Database Schema Overview

```
auth.users (Supabase Auth)
  └─> profiles (user details)
  └─> rooms (expense sharing groups)
       ├─> room_members (who's in each room)
       ├─> groups (subgroups within rooms)
       │    └─> group_members (who's in each group)
       └─> expenses (transactions)
            └─> expense_splits (how expense is divided)

friend_requests (separate friendship system)
```

---

## Next Steps

After completing setup:

1. ✅ All features should work
2. 📱 Add phone numbers to profiles for call functionality
3. 🎨 Customize categories in expense modal if needed
4. 📊 Consider adding export/analytics features
5. 🔐 Review RLS policies for production security

---

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors (F12)
3. Verify all RLS policies are created correctly
4. Ensure you're using the latest schema from `SUPABASE_SCHEMA.sql`
