-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "direction" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_inputLanguageId_fkey" FOREIGN KEY ("inputLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_outputLanguageId_fkey" FOREIGN KEY ("outputLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
