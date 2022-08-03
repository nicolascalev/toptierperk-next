-- AlterTable
ALTER TABLE `benefit` ADD COLUMN `claimAmount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `claim` ADD COLUMN `approvedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `company` ADD COLUMN `allowedEmployeeEmails` JSON NOT NULL,
    ADD COLUMN `claimAmount` INTEGER NOT NULL DEFAULT 0;
