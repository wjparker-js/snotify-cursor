-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `preferences` JSON NULL;
