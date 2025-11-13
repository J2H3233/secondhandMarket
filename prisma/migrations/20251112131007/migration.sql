/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `login_id` on the `user_local_account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user_local_account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `user_local_account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `email`,
    ADD COLUMN `username` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `user_local_account` DROP COLUMN `login_id`,
    ADD COLUMN `email` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_local_account_email_key` ON `user_local_account`(`email`);
