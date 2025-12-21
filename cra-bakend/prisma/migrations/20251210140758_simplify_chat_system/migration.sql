/*
  Warnings:

  - You are about to drop the column `channelId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `parentMessageId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the `channel_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `channels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_mentions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "channel_members" DROP CONSTRAINT "channel_members_channelId_fkey";

-- DropForeignKey
ALTER TABLE "channel_members" DROP CONSTRAINT "channel_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_projectId_fkey";

-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_themeId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_channelId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_parentMessageId_fkey";

-- DropForeignKey
ALTER TABLE "message_mentions" DROP CONSTRAINT "message_mentions_messageId_fkey";

-- DropForeignKey
ALTER TABLE "message_mentions" DROP CONSTRAINT "message_mentions_userId_fkey";

-- DropIndex
DROP INDEX "chat_messages_channelId_idx";

-- DropIndex
DROP INDEX "chat_messages_parentMessageId_idx";

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "channelId",
DROP COLUMN "deletedBy",
DROP COLUMN "metadata",
DROP COLUMN "parentMessageId",
DROP COLUMN "type";

-- DropTable
DROP TABLE "channel_members";

-- DropTable
DROP TABLE "channels";

-- DropTable
DROP TABLE "message_mentions";

-- DropEnum
DROP TYPE "ChannelMemberRole";

-- DropEnum
DROP TYPE "ChannelType";

-- DropEnum
DROP TYPE "MessageType";
