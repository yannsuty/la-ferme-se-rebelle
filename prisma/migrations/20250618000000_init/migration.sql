-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'EMPLOYEE');
CREATE TYPE "ParcelType" AS ENUM ('PASTURE', 'FIELD');
CREATE TYPE "MilkingSession" AS ENUM ('MORNING', 'EVENING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pastures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ParcelType" NOT NULL DEFAULT 'PASTURE',
    "description" TEXT,
    "geometry" JSONB NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#22c55e',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pastures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grazing_assignments" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "session" "MilkingSession" NOT NULL,
    "pastureId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grazing_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "grazing_assignments_date_session_key" ON "grazing_assignments"("date", "session");
CREATE INDEX "grazing_assignments_pastureId_idx" ON "grazing_assignments"("pastureId");

-- AddForeignKey
ALTER TABLE "grazing_assignments" ADD CONSTRAINT "grazing_assignments_pastureId_fkey" FOREIGN KEY ("pastureId") REFERENCES "pastures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grazing_assignments" ADD CONSTRAINT "grazing_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
