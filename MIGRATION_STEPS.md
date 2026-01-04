# 🚀 Complete Migration Steps

## Step 1: Apply SQL Migration

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/wiqbhfwmpyjahaxmwxzg/sql/new

2. **Copy and paste** the entire contents of `APPLY_COMMUNITY_FEED_MIGRATION.sql`

3. **Click Run** (or press Ctrl+Enter)

4. **Verify success** - You should see:
   ```
   NOTICE: Community Feed Migration Complete!
   NOTICE: Tables created: posts, comments, post_likes, comment_likes
   ```

---

## Step 2: Regenerate TypeScript Types

After running the SQL migration, regenerate your TypeScript types:

```bash
npx supabase gen types typescript --project-id wiqbhfwmpyjahaxmwxzg > src/integrations/supabase/types.ts
```

This will update your types to include the new `posts`, `comments`, `post_likes`, and `comment_likes` tables.

---

## Step 3: Verify Everything Works

1. Refresh your app at http://localhost:8080
2. Go to the Home tab
3. Try creating a post
4. The community feed should now work!

---

## ✅ What Gets Created

- **posts** table - Community updates
- **comments** table - Post discussions  
- **post_likes** table - Like tracking
- **comment_likes** table - Comment likes
- **Triggers** - Auto-update like/comment counts
- **RLS Policies** - Security rules
- **Real-time** - Live updates

---

## 🔧 Troubleshooting

**If you see TypeScript errors:**
- Make sure you ran Step 2 to regenerate types
- Restart your dev server

**If posts don't show:**
- Check browser console for errors
- Verify the SQL migration ran successfully
- Check Supabase Dashboard > Table Editor to see if `posts` table exists

**If you can't run the type generation command:**
- You may need to login first: `npx supabase login`
- Or manually update the types file
