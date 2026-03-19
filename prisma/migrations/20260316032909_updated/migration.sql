-- DropIndex
DROP INDEX "OrderItem_orderDetailsId_key";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0;
