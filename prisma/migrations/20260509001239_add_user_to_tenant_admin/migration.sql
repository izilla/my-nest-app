/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TenantAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TenantAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TenantAdmin` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `tenantAdminId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TenantAdmin_userId_key` ON `TenantAdmin`(`userId`);

-- AddForeignKey
ALTER TABLE `TenantAdmin` ADD CONSTRAINT `TenantAdmin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
