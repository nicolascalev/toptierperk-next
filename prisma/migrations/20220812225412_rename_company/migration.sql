/*
  Warnings:

  - You are about to drop the column `companyId` on the `claim` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `company` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessId]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessId` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_availablefor` DROP FOREIGN KEY `_AvailableFor_B_fkey`;

-- DropForeignKey
ALTER TABLE `_beneficiaries` DROP FOREIGN KEY `_Beneficiaries_B_fkey`;

-- DropForeignKey
ALTER TABLE `benefit` DROP FOREIGN KEY `Benefit_supplierId_fkey`;

-- DropForeignKey
ALTER TABLE `claim` DROP FOREIGN KEY `Claim_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_adminOfId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_companyId_fkey`;

-- AlterTable
ALTER TABLE `claim` DROP COLUMN `companyId`,
    ADD COLUMN `businessId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `photo` DROP COLUMN `companyId`,
    ADD COLUMN `businessId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `companyId`,
    ADD COLUMN `businessId` INTEGER NULL;

-- DropTable
DROP TABLE `company`;

-- CreateTable
CREATE TABLE `Business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `about` VARCHAR(191) NULL,
    `paidMembership` BOOLEAN NOT NULL DEFAULT false,
    `lastPaymentDate` DATETIME(3) NULL,
    `paypalSubscriptionId` VARCHAR(191) NULL,
    `claimAmount` INTEGER NOT NULL DEFAULT 0,
    `allowedEmployeeEmails` JSON NOT NULL,

    UNIQUE INDEX `Business_name_key`(`name`),
    UNIQUE INDEX `Business_email_key`(`email`),
    UNIQUE INDEX `Business_paypalSubscriptionId_key`(`paypalSubscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Claim_businessId_key` ON `Claim`(`businessId`);

-- CreateIndex
CREATE UNIQUE INDEX `Photo_businessId_key` ON `Photo`(`businessId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adminOfId_fkey` FOREIGN KEY (`adminOfId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Benefit` ADD CONSTRAINT `Benefit_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_Beneficiaries` ADD CONSTRAINT `_Beneficiaries_B_fkey` FOREIGN KEY (`B`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AvailableFor` ADD CONSTRAINT `_AvailableFor_B_fkey` FOREIGN KEY (`B`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
