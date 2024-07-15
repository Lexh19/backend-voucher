-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher_claim" (
    "id" SERIAL NOT NULL,
    "id_Voucher" INTEGER NOT NULL,
    "tanggal_claim" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voucher_claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Voucher_claim_id_Voucher_idx" ON "Voucher_claim"("id_Voucher");

-- AddForeignKey
ALTER TABLE "Voucher_claim" ADD CONSTRAINT "Voucher_claim_id_Voucher_fkey" FOREIGN KEY ("id_Voucher") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
