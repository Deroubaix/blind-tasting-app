-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(36) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasting" (
    "id" VARCHAR(36) NOT NULL,
    "number" INTEGER NOT NULL,
    "userId" VARCHAR(36) NOT NULL,
    "wineType" TEXT,
    "sight" JSONB,
    "nose" JSONB,
    "palate" JSONB,
    "conclusion" JSONB,
    "wineName" TEXT,
    "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timerDuration" INTEGER,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tasting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Tasting_userId_number_key" ON "Tasting"("userId", "number");

-- AddForeignKey
ALTER TABLE "Tasting" ADD CONSTRAINT "Tasting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
