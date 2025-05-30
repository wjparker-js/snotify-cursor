/*
  Warnings:

  - Added the required column `duration` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `song` ADD COLUMN `duration` VARCHAR(191) NOT NULL,
    ADD COLUMN `genre` VARCHAR(191) NOT NULL DEFAULT 'Rock';
