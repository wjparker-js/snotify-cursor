-- Add Facebook Messenger support to SocialAccount
ALTER TABLE "SocialAccount" ADD COLUMN "accessToken" TEXT;
ALTER TABLE "SocialAccount" ADD COLUMN "refreshToken" TEXT;
ALTER TABLE "SocialAccount" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "SocialAccount" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt to Notification
ALTER TABLE "Notification" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt to PlaylistCollaborator
ALTER TABLE "PlaylistCollaborator" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add composite index for ActivityLog
CREATE INDEX "ActivityLog_type_targetId_idx" ON "ActivityLog"("type", "targetId");

-- Update Playlist default isPublic to false
ALTER TABLE "Playlist" ALTER COLUMN "isPublic" SET DEFAULT false; 