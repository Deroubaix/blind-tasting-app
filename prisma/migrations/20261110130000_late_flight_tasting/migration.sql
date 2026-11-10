-- AlterTable
ALTER TABLE "FlightEntry" ADD COLUMN     "lateTastingId" VARCHAR(36);

-- CreateIndex
CREATE UNIQUE INDEX "FlightEntry_lateTastingId_key" ON "FlightEntry"("lateTastingId");

-- AddForeignKey
ALTER TABLE "FlightEntry" ADD CONSTRAINT "FlightEntry_lateTastingId_fkey" FOREIGN KEY ("lateTastingId") REFERENCES "Tasting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

