# DM Media Cleanup & Retention Plan

This plan addresses both the broken paths caused by hardcoded URLs in the database and your decision to implement Option B (scrubbing image tags from deleted users' messages).

## User Review Required

> [!IMPORTANT]  
> Option B means that once a user is permanently deleted (after 30 days), their DMs will remain for the other participants, but any images they sent in those DMs will be permanently deleted from the server *and* the `<img>` tags will be scrubbed from the message HTML. 
> 
> A placeholder like `[image removed]` will be inserted where the image used to be, ensuring conversation continuity without leaving behind broken "dead link" icons. Does this sound good?

## Proposed Changes

### 1. Database Cleanup (One-Time Migration)
When we moved the message folders on the server earlier, the actual `messages` table in the database still contained hardcoded `<img src="images/uploaded/users/...">` paths in the HTML `content` column.
- I will create a one-time script to do a regex search-and-replace on the `messages` table to correct all paths from `images/uploaded/users/{username}/messages` to `images/uploaded/messages/{username}`.
- I will scrub any orphaned `users//messages` images, as these belong to users who were improperly deleted or had bugs during testing.
- I will physically delete the orphaned `images/uploaded/users/messages` folder from the server.

### 2. Update `DeleteHiddenUsers.php`
- Before deleting the user model, I will query all of their messages: `$user->messages()->get()`.
- For each message, I will parse the `content` HTML and use a regex to strip out any `<img ...>` tags, replacing them with `<p class="notice small">[image removed]</p>`.
- The message will be saved back to the database.
- The script will then delete the `images/uploaded/messages/{username}` folder (as I set up in the previous step) and finally delete the user account.

## Verification Plan
1. I will run the database path fix and verify `stephan_e_perez`'s DMs load images correctly via `messages/stephan_e_perez`.
2. I will run a test where I mark an account for deletion, run the `DeleteHiddenUsers` command, and verify that their old DM partner now sees `[image removed]` instead of a broken image icon.
