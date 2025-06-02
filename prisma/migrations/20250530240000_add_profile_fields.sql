-- Add profile fields to User table
ALTER TABLE `User` 
ADD COLUMN `name` VARCHAR(191) NULL,
ADD COLUMN `avatar` VARCHAR(191) NULL,
ADD COLUMN `bio` TEXT NULL,
ADD COLUMN `preferences` JSON NULL; 