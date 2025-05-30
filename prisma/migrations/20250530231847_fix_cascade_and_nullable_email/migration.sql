-- DropForeignKey
ALTER TABLE `usertenant` DROP FOREIGN KEY `UserTenant_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `usertenant` DROP FOREIGN KEY `UserTenant_userId_fkey`;

-- DropIndex
DROP INDEX `UserTenant_tenantId_fkey` ON `usertenant`;

-- DropIndex
DROP INDEX `UserTenant_userId_fkey` ON `usertenant`;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `UserTenant` ADD CONSTRAINT `UserTenant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTenant` ADD CONSTRAINT `UserTenant_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
