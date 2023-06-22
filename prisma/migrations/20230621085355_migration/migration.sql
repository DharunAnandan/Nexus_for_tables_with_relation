-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_client_id_fkey";

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
