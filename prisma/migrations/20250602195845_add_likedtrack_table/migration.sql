-- CreateTable
CREATE TABLE `likedtrack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `songId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LikedTrack_userId_fkey`(`userId`),
    INDEX `LikedTrack_songId_fkey`(`songId`),
    UNIQUE INDEX `LikedTrack_userId_songId_key`(`userId`, `songId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `likedtrack` ADD CONSTRAINT `LikedTrack_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likedtrack` ADD CONSTRAINT `LikedTrack_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
