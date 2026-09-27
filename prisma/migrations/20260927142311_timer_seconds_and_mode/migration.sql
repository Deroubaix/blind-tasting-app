-- The timer moves from whole minutes to seconds. The old Int column truncated the 7:30 preset
-- to 7, so a stored 7 is read back as 7:30 (450s). Every existing timed tasting used the
-- per-phase clock, so it becomes "guided".
ALTER TABLE "Tasting" ADD COLUMN "timerSeconds" INTEGER;
ALTER TABLE "Tasting" ADD COLUMN "timerMode" TEXT;

UPDATE "Tasting"
SET "timerSeconds" = CASE WHEN "timerDuration" = 7 THEN 450 ELSE "timerDuration" * 60 END,
    "timerMode" = 'guided'
WHERE "timerDuration" IS NOT NULL;

ALTER TABLE "Tasting" DROP COLUMN "timerDuration";
