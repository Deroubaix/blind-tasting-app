-- Archiving was never built; deleting a tasting replaced it. Every row held false.
ALTER TABLE "Tasting" DROP COLUMN "isArchived";
