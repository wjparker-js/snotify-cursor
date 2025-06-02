-- Create SocialAccount table
CREATE TABLE `SocialAccount` (
  `id` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191),
  `image` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SocialAccount_provider_providerId_key` (`provider`, `providerId`),
  INDEX `SocialAccount_userId_idx` (`userId`),
  CONSTRAINT `SocialAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Follow table
CREATE TABLE `Follow` (
  `id` VARCHAR(191) NOT NULL,
  `followerId` VARCHAR(191) NOT NULL,
  `followingId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Follow_followerId_followingId_key` (`followerId`, `followingId`),
  INDEX `Follow_followerId_idx` (`followerId`),
  INDEX `Follow_followingId_idx` (`followingId`),
  CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create PlaylistCollaborator table
CREATE TABLE `PlaylistCollaborator` (
  `id` VARCHAR(191) NOT NULL,
  `playlistId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'editor',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PlaylistCollaborator_playlistId_userId_key` (`playlistId`, `userId`),
  INDEX `PlaylistCollaborator_playlistId_idx` (`playlistId`),
  INDEX `PlaylistCollaborator_userId_idx` (`userId`),
  CONSTRAINT `PlaylistCollaborator_playlistId_fkey` FOREIGN KEY (`playlistId`) REFERENCES `Playlist` (`id`) ON DELETE CASCADE,
  CONSTRAINT `PlaylistCollaborator_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create ActivityLog table
CREATE TABLE `ActivityLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `targetId` VARCHAR(191),
  `metadata` JSON,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ActivityLog_userId_idx` (`userId`),
  INDEX `ActivityLog_type_idx` (`type`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Notification table
CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `message` VARCHAR(191) NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT false,
  `metadata` JSON,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Notification_userId_idx` (`userId`),
  INDEX `Notification_read_idx` (`read`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add isPublic field to Playlist table
ALTER TABLE `Playlist` ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT true; 