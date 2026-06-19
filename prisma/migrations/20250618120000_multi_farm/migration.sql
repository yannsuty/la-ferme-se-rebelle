-- Multi-fermes : slug dans l'URL, adhésions utilisateur par ferme

CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "farms_slug_key" ON "farms"("slug");

INSERT INTO "farms" ("id", "name", "slug", "active", "createdAt", "updatedAt")
VALUES ('farm_default_rebelle', 'La Ferme se Rebelle', 'ferme-rebelle', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "farm_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_memberships_pkey" PRIMARY KEY ("id")
);

INSERT INTO "farm_memberships" ("id", "userId", "farmId", "role", "active", "createdAt", "updatedAt")
SELECT
    'membership_' || "id",
    "id",
    'farm_default_rebelle',
    "role",
    "active",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users";

ALTER TABLE "pastures" ADD COLUMN "farmId" TEXT;
UPDATE "pastures" SET "farmId" = 'farm_default_rebelle';
ALTER TABLE "pastures" ALTER COLUMN "farmId" SET NOT NULL;

ALTER TABLE "grazing_assignments" ADD COLUMN "farmId" TEXT;
UPDATE "grazing_assignments" ga
SET "farmId" = p."farmId"
FROM "pastures" p
WHERE ga."pastureId" = p."id";
ALTER TABLE "grazing_assignments" ALTER COLUMN "farmId" SET NOT NULL;

DROP INDEX "grazing_assignments_date_session_key";
CREATE UNIQUE INDEX "grazing_assignments_farmId_date_session_key" ON "grazing_assignments"("farmId", "date", "session");
CREATE INDEX "pastures_farmId_idx" ON "pastures"("farmId");
CREATE UNIQUE INDEX "farm_memberships_userId_farmId_key" ON "farm_memberships"("userId", "farmId");
CREATE INDEX "farm_memberships_farmId_idx" ON "farm_memberships"("farmId");

ALTER TABLE "pastures" ADD CONSTRAINT "pastures_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grazing_assignments" ADD CONSTRAINT "grazing_assignments_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farm_memberships" ADD CONSTRAINT "farm_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farm_memberships" ADD CONSTRAINT "farm_memberships_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" DROP COLUMN "role";
