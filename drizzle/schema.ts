import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table for email/password authentication.
 * Removed OAuth dependency, using custom auth instead.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("passwordHash").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isBanned: boolean("isBanned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tickets table - represents a support request with file upload
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  filePath: text("filePath").notNull(), // S3 path
  status: mysqlEnum("status", ["pending", "paid", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // R$ value
  paymentId: varchar("paymentId", { length: 255 }), // MisticPay payment ID
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  correctedFilePath: text("correctedFilePath"), // S3 path to corrected file
  correctedFileName: varchar("correctedFileName", { length: 255 }),
  isDelivered: boolean("isDelivered").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Chat messages table - stores all messages between client and support
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "file"]).default("text").notNull(),
  content: longtext("content"), // text content or file path for files
  fileName: varchar("fileName", { length: 255 }), // for file uploads
  fileSize: int("fileSize"), // in bytes
  filePath: text("filePath"), // S3 path for files
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Admin logs table - tracks administrative actions
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetUserId: int("targetUserId"),
  targetTicketId: int("targetTicketId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * System settings table - stores configuration
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 255 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
