/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `refreshtoken` DROP FOREIGN KEY `RefreshToken_userId_fkey`;

-- DropIndex
DROP INDEX `RefreshToken_userId_key` ON `refreshtoken`;

-- AlterTable
ALTER TABLE `refreshtoken` ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `isValid` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshToken_token_key` ON `RefreshToken`(`token`);

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
