-- AlterTable
ALTER TABLE `post` MODIFY `transaction_type` ENUM('IN_PERSON', 'PARCEL', 'BOTH') NULL;
