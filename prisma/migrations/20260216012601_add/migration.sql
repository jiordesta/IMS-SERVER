/*
  Warnings:

  - Added the required column `name` to the `RoleDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoleDetails" ADD COLUMN     "name" TEXT NOT NULL;
