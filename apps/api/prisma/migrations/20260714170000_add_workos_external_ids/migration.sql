-- AlterTable
ALTER TABLE "organisations" ADD COLUMN     "workos_org_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "workos_user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organisations_workos_org_id_key" ON "organisations"("workos_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_workos_user_id_key" ON "users"("workos_user_id");

