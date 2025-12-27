# Phase 1.2: Row Level Security (RLS) Policies

## marcospeoples.com - Supabase Security Rules

**Date Created:** December 27, 2025  
**Status:** Complete  
**Security Model:** Public read, authenticated write, owner modify

---

## TABLE OF CONTENTS

1. [Security Philosophy](#security-philosophy)
2. [User Roles](#user-roles)
3. [Users Table Policies](#users-table-policies)
4. [Memories Table Policies](#memories-table-policies)
5. [Media Table Policies](#media-table-policies)
6. [Reports Table Policies](#reports-table-policies)
7. [Translations Table Policies](#translations-table-policies)
8. [Moderators Table Policies](#moderators-table-policies)
9. [Storage Bucket Policies](#storage-bucket-policies)
10. [Implementation Guide](#implementation-guide)

---

## SECURITY PHILOSOPHY

### Core Principles

**Trust-Based Memorial**

- Open read access for all visitors (no authentication required to view)
- Low barrier for contributions (anonymous users can submit)
- Equal permissions for anonymous and authenticated users
- Post-moderation rather than pre-moderation

**Security Layers**

1. **Public Layer**: Anyone can view published memories and photos
2. **Contributor Layer**: Both anonymous and authenticated users can create content
3. **Owner Layer**: Users can edit/delete their own content
4. **Moderator Layer**: Manual moderation via Supabase dashboard (Phase 1)

**Data Visibility**

- Hidden memories (`is_hidden = TRUE`) not shown to public
- Deleted content (`is_deleted = TRUE`) not shown to public
- Moderators see everything via Supabase dashboard

---

## USER ROLES

### 1. Anonymous Visitors (Unauthenticated)

- **Can READ**: All published memories and photos
- **Cannot WRITE**: Must create user profile first (anonymous or Google)

### 2. Anonymous Users (Authenticated as Anonymous)

- **Can READ**: All published memories and photos
- **Can WRITE**: Create memories, upload photos
- **Can UPDATE**: Own memories and photos
- **Can DELETE**: Own memories and photos

### 3. Google OAuth Users (Authenticated via Google)

- **Can READ**: All published memories and photos
- **Can WRITE**: Create memories, upload photos
- **Can UPDATE**: Own memories and photos
- **Can DELETE**: Own memories and photos
- **Same permissions as anonymous users**

### 4. Moderators

- **Phase 1**: Manual access via Supabase dashboard
- **Phase 5** (Future): Moderation dashboard in app
- **Can**: View all content, hide/delete any memory, review reports

---

## USERS TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Public Read

**Purpose**: Anyone can view user profiles (for attribution on memories)

```sql
CREATE POLICY "Anyone can view user profiles"
ON users FOR SELECT
USING (true);
```

### Policy 2: Users Can Insert Their Own Profile

**Purpose**: Allow user creation during signup

```sql
CREATE POLICY "Users can create their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Policy 3: Users Can Update Their Own Profile

**Purpose**: Allow users to update their own information

```sql
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Policy 4: No Public Deletion

**Purpose**: Users cannot delete their profiles (soft delete only via app)

```sql
-- No DELETE policy - handled via application logic with soft deletes
-- Moderators delete via Supabase dashboard if needed
```

---

## MEMORIES TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Public Read (Visible Memories Only)

**Purpose**: Anyone can read published, non-hidden memories

```sql
CREATE POLICY "Anyone can view published memories"
ON memories FOR SELECT
USING (
  is_hidden = false
  AND is_deleted = false
);
```

### Policy 2: Authenticated Users Can Create

**Purpose**: Both anonymous and Google users can submit memories

```sql
CREATE POLICY "Authenticated users can create memories"
ON memories FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);
```

**Note**: This works for both anonymous and Google OAuth users because Supabase treats both as "authenticated" once they have a session.

### Policy 3: Users Can Update Their Own Memories

**Purpose**: Allow contributors to edit their submissions

```sql
CREATE POLICY "Users can update their own memories"
ON memories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Policy 4: Users Can Delete Their Own Memories

**Purpose**: Allow contributors to remove their submissions

```sql
CREATE POLICY "Users can delete their own memories"
ON memories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

**Note**: In application, prefer soft deletes (setting `is_deleted = true`) over hard deletes.

---

## MEDIA TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Public Read (Photos of Visible Memories)

**Purpose**: Anyone can view photos attached to published memories

```sql
CREATE POLICY "Anyone can view photos of published memories"
ON media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.is_hidden = false
    AND memories.is_deleted = false
  )
);
```

### Policy 2: Authenticated Users Can Upload

**Purpose**: Both anonymous and Google users can upload photos

```sql
CREATE POLICY "Authenticated users can upload photos"
ON media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);
```

**Note**: Users can only add photos to their own memories.

### Policy 3: Users Can Update Their Own Photos

**Purpose**: Allow reordering or updating photo metadata

```sql
CREATE POLICY "Users can update their own photos"
ON media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);
```

### Policy 4: Users Can Delete Their Own Photos

**Purpose**: Allow removing photos from their memories

```sql
CREATE POLICY "Users can delete their own photos"
ON media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = media.memory_id
    AND memories.user_id = auth.uid()
  )
);
```

---

## REPORTS TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Authenticated Users Can Create Reports

**Purpose**: Allow users to report inappropriate content

```sql
CREATE POLICY "Authenticated users can report content"
ON reports FOR INSERT
TO authenticated
WITH CHECK (true);
```

**Note**: Any authenticated user can report any memory.

### Policy 2: Reports Are Private

**Purpose**: Only moderators can view reports (via Supabase dashboard)

```sql
-- No SELECT policy for regular users
-- Moderators access via Supabase dashboard with elevated permissions
```

### Policy 3: Users Can View Their Own Reports

**Purpose**: Allow users to see their submitted reports

```sql
CREATE POLICY "Users can view their own reports"
ON reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);
```

### Policy 4: No Public Update/Delete

**Purpose**: Reports cannot be modified after submission

```sql
-- No UPDATE or DELETE policies for regular users
-- Moderators handle via Supabase dashboard
```

---

## TRANSLATIONS TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Public Read

**Purpose**: Anyone can view cached translations

```sql
CREATE POLICY "Anyone can view translations"
ON translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = translations.memory_id
    AND memories.is_hidden = false
    AND memories.is_deleted = false
  )
);
```

### Policy 2: System Can Create Translations

**Purpose**: Translation service (Edge Function) can cache results

```sql
CREATE POLICY "Service role can create translations"
ON translations FOR INSERT
TO service_role
WITH CHECK (true);
```

**Note**: Translation creation happens server-side via Edge Functions using service_role key.

### Policy 3: No Public Modification

**Purpose**: Translations are system-managed

```sql
-- No UPDATE or DELETE policies for users
-- Translations managed by system/moderators
```

---

## MODERATORS TABLE POLICIES

### Enable RLS

```sql
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Moderators Can View Moderator List

**Purpose**: Moderators can see who else is a moderator

```sql
CREATE POLICY "Moderators can view moderator list"
ON moderators FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM moderators WHERE is_active = true)
);
```

### Policy 2: No Public Write Access

**Purpose**: Moderators added manually via Supabase dashboard

```sql
-- No INSERT, UPDATE, or DELETE policies for users
-- Moderators managed via Supabase dashboard by system admin
```

---

## STORAGE BUCKET POLICIES

### Bucket: memories-photos

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view photos
CREATE POLICY "Anyone can view memory photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories-photos');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'memories-photos'
  AND (ARRAY_LENGTH(STRING_TO_ARRAY(name, '/'), 1)) >= 2  -- Must have path structure
);

-- Policy 3: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'memories-photos'
  AND owner = auth.uid()
);
```

### Bucket: memories-thumbnails

```sql
-- Policy 1: Anyone can view thumbnails
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories-thumbnails');

-- Policy 2: Service role can create thumbnails
CREATE POLICY "Service can create thumbnails"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'memories-thumbnails');

-- Policy 3: Service role can delete thumbnails
CREATE POLICY "Service can delete thumbnails"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'memories-thumbnails');
```

---

## IMPLEMENTATION GUIDE

### Phase 2.2: Initial Setup

**Step 1: Enable RLS on All Tables**

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

**Step 2: Apply Policies**

- Copy policies from this document
- Execute in Supabase SQL editor
- Test each policy with sample data

**Step 3: Verify Policies**

```sql
-- Check policies are active
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### Testing RLS Policies

**Test as Anonymous Visitor (No Auth)**

```javascript
// Should work: Read memories
const { data, error } = await supabase.from("memories").select("*");

// Should fail: Create memory
const { data, error } = await supabase
  .from("memories")
  .insert({ title: "Test" });
```

**Test as Authenticated User**

```javascript
// Should work: Create memory
const { data, error } = await supabase.from("memories").insert({
  user_id: userId,
  title: "My Memory",
  story: "Test story",
});

// Should work: Update own memory
const { data, error } = await supabase
  .from("memories")
  .update({ title: "Updated" })
  .eq("user_id", userId);

// Should fail: Update someone else's memory
const { data, error } = await supabase
  .from("memories")
  .update({ title: "Hacked" })
  .eq("user_id", someOtherUserId);
```

### Moderator Access (Phase 1)

**Via Supabase Dashboard:**

1. Go to Supabase project → Table Editor
2. Select table to moderate
3. View all rows (RLS bypassed for admin)
4. Manually update `is_hidden = true` or delete rows
5. View reports in `reports` table

**Future (Phase 5): Moderation Dashboard**

- Build admin interface in app
- Check if user is moderator: `SELECT * FROM moderators WHERE user_id = auth.uid()`
- Create moderator-specific policies for bulk actions

---

## SECURITY CONSIDERATIONS

### Data Protection

**Sensitive Data:**

- Email addresses: Only visible to user who owns them
- Reporter IDs: Can be null for anonymous reports
- Moderator notes: Not exposed via public policies

**Public Data:**

- Memory titles and stories
- Photo URLs (content is public memorial)
- User display names and profile pictures
- Location information

### Rate Limiting

**Application Layer (Phase 3):**

- Limit memory submissions: 5 per hour per user
- Limit photo uploads: 20 photos per memory
- Limit reports: 10 per day per user

**Supabase Layer:**

- Configure API rate limits in project settings
- Set connection limits
- Monitor abuse via logs

### Attack Vectors & Mitigations

| Attack                | Mitigation                             |
| --------------------- | -------------------------------------- |
| SQL Injection         | RLS policies use parameterized queries |
| XSS                   | Sanitize all text input in frontend    |
| CSRF                  | Supabase tokens are HTTP-only          |
| Spam submissions      | Rate limiting + IP tracking            |
| File upload abuse     | File size limits + format validation   |
| Inappropriate content | Post-moderation + reporting system     |

---

## PERMISSION MATRIX

| Action         | Anonymous Visitor | Anonymous User | Google User | Moderator |
| -------------- | ----------------- | -------------- | ----------- | --------- |
| **Memories**   |
| View published | ✅                | ✅             | ✅          | ✅        |
| View hidden    | ❌                | ❌             | ❌          | ✅\*      |
| Create         | ❌                | ✅             | ✅          | ✅        |
| Update own     | ❌                | ✅             | ✅          | ✅        |
| Update others  | ❌                | ❌             | ❌          | ✅\*      |
| Delete own     | ❌                | ✅             | ✅          | ✅        |
| Delete others  | ❌                | ❌             | ❌          | ✅\*      |
| **Photos**     |
| View published | ✅                | ✅             | ✅          | ✅        |
| Upload         | ❌                | ✅             | ✅          | ✅        |
| Delete own     | ❌                | ✅             | ✅          | ✅        |
| Delete others  | ❌                | ❌             | ❌          | ✅\*      |
| **Reports**    |
| Submit         | ❌                | ✅             | ✅          | ✅        |
| View own       | ❌                | ✅             | ✅          | ✅        |
| View all       | ❌                | ❌             | ❌          | ✅\*      |
| Resolve        | ❌                | ❌             | ❌          | ✅\*      |
| **Users**      |
| View profiles  | ✅                | ✅             | ✅          | ✅        |
| Create profile | ✅                | ✅             | ✅          | ✅        |
| Edit own       | ❌                | ✅             | ✅          | ✅        |

\*✅\*\* = Via Supabase dashboard in Phase 1, via app in Phase 5

---

## FUTURE ENHANCEMENTS (Phase 5+)

### Moderator Dashboard Policies

When building moderator dashboard in Phase 5:

```sql
-- Check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM moderators
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Moderators can view all memories
CREATE POLICY "Moderators can view all memories"
ON memories FOR SELECT
TO authenticated
USING (
  is_moderator() = true
  OR (is_hidden = false AND is_deleted = false)
);

-- Moderators can update any memory
CREATE POLICY "Moderators can update any memory"
ON memories FOR UPDATE
TO authenticated
USING (is_moderator() = true OR auth.uid() = user_id)
WITH CHECK (is_moderator() = true OR auth.uid() = user_id);

-- Moderators can delete any memory
CREATE POLICY "Moderators can delete any memory"
ON memories FOR DELETE
TO authenticated
USING (is_moderator() = true OR auth.uid() = user_id);
```

### Advanced Permissions

**Potential future roles:**

- **Contributor**: Current default (can create/edit own)
- **Trusted Contributor**: No rate limits, auto-approved
- **Moderator**: Can hide/delete, review reports
- **Admin**: Full access, can manage moderators

---

## MONITORING & AUDITING

### Recommended Logging

**Track in application:**

- Failed authentication attempts
- Memory submissions (user_id, timestamp, IP)
- Photo uploads (user_id, file size, timestamp)
- Reports submitted (memory_id, reason)
- Moderation actions (who, what, when)

**Supabase Analytics:**

- Monitor API usage patterns
- Track authentication success/failure rates
- Review slow queries (may need index optimization)
- Check storage usage growth

### Audit Table (Future)

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),  -- 'create', 'update', 'delete', 'hide'
  table_name VARCHAR(50),
  record_id UUID,
  changes JSONB,  -- Before/after values
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TROUBLESHOOTING

### Common RLS Issues

**Problem**: Users can't see their own content after creating it

- **Solution**: Ensure `user_id` matches `auth.uid()` in insert

**Problem**: Photos not loading for published memories

- **Solution**: Check storage bucket policies allow public SELECT

**Problem**: Anonymous users can't submit

- **Solution**: Verify anonymous auth is enabled in Supabase Auth settings

**Problem**: Moderators can't access content

- **Solution**: Phase 1 uses Supabase dashboard (bypasses RLS), not app

### Testing RLS Locally

```javascript
// Helper function to test policy
async function testPolicy(userId) {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId);

  console.log("Can read:", !error);
  console.log("Row count:", data?.length);
}
```

---

## NEXT STEPS

✅ **RLS Policies Complete**

**Now Ready For:**

1. Plan authentication flows → Task 3
2. Design site navigation structure → Task 4
3. Define metadata taxonomy → Task 5

**In Phase 2.2 (Supabase Configuration):**

- Apply these RLS policies in Supabase SQL editor
- Test policies with sample users
- Verify security with edge cases
- Monitor for policy violations in logs

---

**Document Status:** ✅ Complete - Ready for Implementation  
**Last Updated:** December 27, 2025  
**Security Level:** Public read, authenticated write, owner modify  
**Moderation:** Manual (Phase 1) → Dashboard (Phase 5)
