-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sms_code" TEXT,
ADD COLUMN     "sms_code_expires" TIMESTAMP(3);
