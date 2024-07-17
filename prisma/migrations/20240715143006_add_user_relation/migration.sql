/*
  Warnings:

  - Added the required column `id_User` to the `Voucher_claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Voucher_claim" ADD COLUMN     "id_User" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Voucher_claim" ADD CONSTRAINT "Voucher_claim_id_User_fkey" FOREIGN KEY ("id_User") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
