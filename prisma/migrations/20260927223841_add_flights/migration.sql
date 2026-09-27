-- CreateTable
CREATE TABLE "Flight" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" VARCHAR(36) NOT NULL,
    "wineCount" INTEGER NOT NULL,
    "timerSeconds" INTEGER,
    "endedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightWine" (
    "flightId" VARCHAR(36) NOT NULL,
    "number" INTEGER NOT NULL,
    "reveal" JSONB,
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "FlightWine_pkey" PRIMARY KEY ("flightId","number")
);

-- CreateTable
CREATE TABLE "FlightMember" (
    "flightId" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36) NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightMember_pkey" PRIMARY KEY ("flightId","userId")
);

-- CreateTable
CREATE TABLE "FlightEntry" (
    "flightId" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36) NOT NULL,
    "wineNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tastingId" VARCHAR(36),

    CONSTRAINT "FlightEntry_pkey" PRIMARY KEY ("flightId","userId","wineNumber")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flight_code_key" ON "Flight"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FlightEntry_tastingId_key" ON "FlightEntry"("tastingId");

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightWine" ADD CONSTRAINT "FlightWine_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightMember" ADD CONSTRAINT "FlightMember_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightMember" ADD CONSTRAINT "FlightMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightEntry" ADD CONSTRAINT "FlightEntry_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightEntry" ADD CONSTRAINT "FlightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightEntry" ADD CONSTRAINT "FlightEntry_tastingId_fkey" FOREIGN KEY ("tastingId") REFERENCES "Tasting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
