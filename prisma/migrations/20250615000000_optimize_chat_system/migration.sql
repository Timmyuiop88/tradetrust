-- Optimize chat system for better performance and consistency

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS "ChatMessage_orderId_idx" ON "ChatMessage"("orderId");
CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX IF NOT EXISTS "ChatMessage_recipientId_idx" ON "ChatMessage"("recipientId");
CREATE INDEX IF NOT EXISTS "ChatMessage_disputeId_idx" ON "ChatMessage"("disputeId");
CREATE INDEX IF NOT EXISTS "ChatMessage_isRead_idx" ON "ChatMessage"("isRead");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "ChatMessage_orderId_recipientId_isRead_idx" 
ON "ChatMessage"("orderId", "recipientId", "isRead");

CREATE INDEX IF NOT EXISTS "ChatMessage_recipientId_isRead_idx" 
ON "ChatMessage"("recipientId", "isRead");

-- Ensure we have the right constraints
ALTER TABLE "ChatMessage" 
ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "recipientId" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "isRead" SET DEFAULT false; 