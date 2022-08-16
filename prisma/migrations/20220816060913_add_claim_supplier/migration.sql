/*
  Warnings:

  - Added the required column `supplierId` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `claim` ADD COLUMN `supplierId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
