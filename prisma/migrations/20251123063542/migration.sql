-- AlterTable
ALTER TABLE `category` ADD COLUMN `root_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_category_root_idx` ON `category`(`root_id`);

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `FK_category_root` FOREIGN KEY (`root_id`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
