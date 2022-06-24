/*
  Warnings:

  - You are about to drop the column `logo` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `company` DROP COLUMN `logo`;

-- AlterTable
ALTER TABLE `photo` ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `picture`;

-- CreateIndex
CREATE UNIQUE INDEX `Photo_userId_key` ON `Photo`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Photo_companyId_key` ON `Photo`(`companyId`);

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
