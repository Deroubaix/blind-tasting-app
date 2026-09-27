-- Emails are now stored lowercase and trimmed (see src/schemas/auth.ts). Bring existing rows in
-- line so their owners can still log in. If two accounts differ only by case this fails on the
-- unique index instead of merging them — resolve those by hand, then re-run.
UPDATE "User" SET "email" = lower(trim("email")) WHERE "email" <> lower(trim("email"));
