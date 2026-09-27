-- CreateTable
CREATE TABLE "RateLimit" (
    "key" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);
