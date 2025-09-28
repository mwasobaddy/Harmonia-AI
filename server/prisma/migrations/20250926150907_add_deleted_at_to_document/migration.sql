-- AlterTable
ALTER TABLE "documents" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "deletedAt" DATETIME;
