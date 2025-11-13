/*
  Warnings:

  - A unique constraint covering the columns `[region_code]` on the table `region` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `region_region_code_key` ON `region`(`region_code`);
