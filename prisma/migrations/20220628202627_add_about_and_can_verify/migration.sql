-- AlterTable
ALTER TABLE `company` ADD COLUMN `about` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `canVerify` BOOLEAN NOT NULL DEFAULT false;
