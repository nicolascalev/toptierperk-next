/*
  Warnings:

  - You are about to drop the column `lastPaymentDate` on the `business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `business` DROP COLUMN `lastPaymentDate`,
    ADD COLUMN `subscriptionEndsAt` DATETIME(3) NULL;
