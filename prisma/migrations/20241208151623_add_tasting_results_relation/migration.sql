/*
  Warnings:

  - You are about to drop the column `type` on the `Tasting` table. All the data in the column will be lost.
  - Made the column `created_at` on table `Tasting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tasting" DROP COLUMN "type",
ADD COLUMN     "conclusion" JSONB,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nose" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "palate" JSONB,
ADD COLUMN     "sight" JSONB,
ADD COLUMN     "timerDuration" INTEGER,
ADD COLUMN     "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wineName" TEXT,
ADD COLUMN     "wineType" TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
