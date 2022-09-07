-- DropForeignKey
ALTER TABLE `Feedback` DROP FOREIGN KEY `Feedback_benefitId_fkey`;

-- DropForeignKey
ALTER TABLE `Feedback` DROP FOREIGN KEY `Feedback_claimId_fkey`;

-- AlterTable
ALTER TABLE `Feedback` MODIFY `benefitId` INTEGER NULL,
    MODIFY `claimId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_benefitId_fkey` FOREIGN KEY (`benefitId`) REFERENCES `Benefit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
