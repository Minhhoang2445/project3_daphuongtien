-- CreateTable
CREATE TABLE `streamers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `streamKey` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `status` ENUM('OFFLINE', 'LIVE') NOT NULL DEFAULT 'OFFLINE',
    `hlsUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `streamers_username_key`(`username`),
    UNIQUE INDEX `streamers_streamKey_key`(`streamKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `viewers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `viewers_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `videos` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `streamerId` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('VOD', 'RECORD') NOT NULL DEFAULT 'VOD',
    `hlsUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `videos_streamerId_idx`(`streamerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `streamerId` BIGINT NOT NULL,
    `viewerId` BIGINT NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_messages_streamerId_idx`(`streamerId`),
    INDEX `chat_messages_viewerId_idx`(`viewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `videos` ADD CONSTRAINT `videos_streamerId_fkey` FOREIGN KEY (`streamerId`) REFERENCES `streamers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_streamerId_fkey` FOREIGN KEY (`streamerId`) REFERENCES `streamers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_viewerId_fkey` FOREIGN KEY (`viewerId`) REFERENCES `viewers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
