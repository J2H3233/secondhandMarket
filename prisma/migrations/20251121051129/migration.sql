/*
  Warnings:

  - Added the required column `order` to the `post_img` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post_img` ADD COLUMN `order` INTEGER NOT NULL;
