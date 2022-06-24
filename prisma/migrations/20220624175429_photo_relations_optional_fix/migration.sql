-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_benefitId_fkey`;

-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_userId_fkey`;

-- AlterTable
ALTER TABLE `photo` MODIFY `benefitId` INTEGER NULL,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_benefitId_fkey` FOREIGN KEY (`benefitId`) REFERENCES `Benefit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
