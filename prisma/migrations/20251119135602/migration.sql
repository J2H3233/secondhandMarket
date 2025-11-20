/*
  Warnings:

  - You are about to drop the column `chat_room_id` on the `message` table. All the data in the column will be lost.
  - You are about to drop the `category_post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chatroom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `user_local_account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trade_id` to the `message` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `category_post` DROP FOREIGN KEY `FK_category_TO_category_post_1`;

-- DropForeignKey
ALTER TABLE `category_post` DROP FOREIGN KEY `FK_post_TO_category_post_1`;

-- DropForeignKey
ALTER TABLE `chatroom` DROP FOREIGN KEY `FK_trade_TO_chatroom_1`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `FK_chatroom_TO_message_1`;

-- DropIndex
DROP INDEX `FK_chatroom_TO_message_1` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `chat_room_id`,
    ADD COLUMN `trade_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `category_id` INTEGER NULL,
    MODIFY `status` ENUM('OPEN', 'CLOSE') NOT NULL DEFAULT 'OPEN',
    MODIFY `views` INTEGER NULL DEFAULT 0,
    MODIFY `is_deleted` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `trade` ADD COLUMN `closed_at` TIMESTAMP(0) NULL,
    ADD COLUMN `is_close` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `trade_record` ADD COLUMN `address_detail` VARCHAR(255) NULL,
    ADD COLUMN `region_id` INTEGER NULL;

-- DropTable
DROP TABLE `category_post`;

-- DropTable
DROP TABLE `chatroom`;

-- CreateTable
CREATE TABLE `message_img` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(512) NULL,

    UNIQUE INDEX `message_img_message_id_key`(`message_id`),
    INDEX `FK_message_TO_message_img_1`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `FK_trade_TO_message_1` ON `message`(`trade_id`);

-- CreateIndex
CREATE INDEX `FK_category_TO_post_1` ON `post`(`category_id`);

-- CreateIndex
CREATE INDEX `FK_region_TO_trade_record_1` ON `trade_record`(`region_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_local_account_user_id_key` ON `user_local_account`(`user_id`);

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `FK_category_TO_post_1` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_record` ADD CONSTRAINT `FK_region_TO_trade_record_1` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `FK_trade_TO_message_1` FOREIGN KEY (`trade_id`) REFERENCES `trade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_img` ADD CONSTRAINT `FK_message_TO_message_img_1` FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
