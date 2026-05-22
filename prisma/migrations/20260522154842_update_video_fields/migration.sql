-- AlterTable
ALTER TABLE `streamers` ADD COLUMN `restreamVideo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `videos` ADD COLUMN `recordPath` VARCHAR(191) NULL,
    ADD COLUMN `vodPath` VARCHAR(191) NULL,
    MODIFY `type` ENUM('VOD', 'RECORD') NOT NULL DEFAULT 'RECORD';
