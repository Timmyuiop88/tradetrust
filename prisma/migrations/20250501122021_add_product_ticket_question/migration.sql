-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "available" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "transferable" BOOLEAN NOT NULL DEFAULT false,
    "limitPerBuyer" BOOLEAN NOT NULL DEFAULT false,
    "maxPerBuyer" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventTicketToTicketType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventTicketToTicketType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketType_productId_name_key" ON "TicketType"("productId", "name");

-- CreateIndex
CREATE INDEX "_EventTicketToTicketType_B_index" ON "_EventTicketToTicketType"("B");

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTicketToTicketType" ADD CONSTRAINT "_EventTicketToTicketType_A_fkey" FOREIGN KEY ("A") REFERENCES "EventTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTicketToTicketType" ADD CONSTRAINT "_EventTicketToTicketType_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
