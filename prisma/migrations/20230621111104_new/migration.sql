-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "profile_client_index" ON "profile"("client_id");

-- CreateIndex
CREATE INDEX "profile_client_deleted_index" ON "profile"("client_id", "is_deleted");
