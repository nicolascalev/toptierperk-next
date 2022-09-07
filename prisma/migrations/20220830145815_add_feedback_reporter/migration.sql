/*
  Warnings:

  - Added the required column `reporterId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Feedback` ADD COLUMN `reporterId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
