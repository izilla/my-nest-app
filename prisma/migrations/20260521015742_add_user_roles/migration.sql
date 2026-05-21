-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('THERAPIST', 'CLIENT', 'TENANT_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY['CLIENT']::"UserRole"[];
