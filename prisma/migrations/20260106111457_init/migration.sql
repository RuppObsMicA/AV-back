-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'banned');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "socialId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateBirth" DATE,
    "photoId" TEXT,
    "newEmail" TEXT,
    "confirmationHash" TEXT,
    "confirmationExpires" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "isTwoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "directoryId" INTEGER,
    "organizationId" INTEGER,
    "inputLanguageId" INTEGER,
    "outputLanguageId" INTEGER,
    "departmentId" INTEGER,
    "statusId" INTEGER,
    "subscribePlanId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user-roles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user-roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_confirmationHash_key" ON "users"("confirmationHash");

-- CreateIndex
CREATE UNIQUE INDEX "roles_value_key" ON "roles"("value");

-- CreateIndex
CREATE UNIQUE INDEX "user-roles_userId_roleId_key" ON "user-roles"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "user-roles" ADD CONSTRAINT "user-roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user-roles" ADD CONSTRAINT "user-roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
