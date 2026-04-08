-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkEvent" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,

    CONSTRAINT "LinkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkHistory" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "oldDestinationUrl" TEXT NOT NULL,
    "newDestinationUrl" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Link_slug_key" ON "Link"("slug");

-- CreateIndex
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");

-- CreateIndex
CREATE INDEX "LinkEvent_clickedAt_idx" ON "LinkEvent"("clickedAt");

-- CreateIndex
CREATE INDEX "LinkEvent_linkId_clickedAt_idx" ON "LinkEvent"("linkId", "clickedAt");

-- CreateIndex
CREATE INDEX "LinkHistory_linkId_changedAt_idx" ON "LinkHistory"("linkId", "changedAt");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkEvent" ADD CONSTRAINT "LinkEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkHistory" ADD CONSTRAINT "LinkHistory_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkHistory" ADD CONSTRAINT "LinkHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

