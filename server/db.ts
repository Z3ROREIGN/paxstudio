import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertTicket, tickets, InsertChatMessage, chatMessages, InsertAdminLog, adminLogs, systemSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create or update a user (email/password auth)
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
      name: user.name || "",
      passwordHash: user.passwordHash || "",
    };
    const updateSet: Record<string, unknown> = {};

    if (user.name !== undefined) {
      values.name = user.name;
      updateSet.name = user.name;
    }

    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (user.isBanned !== undefined) {
      values.isBanned = user.isBanned;
      updateSet.isBanned = user.isBanned;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.updatedAt = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all users (for admin panel)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users);
}

/**
 * Ban/unban user
 */
export async function updateUserBanStatus(userId: number, isBanned: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ isBanned }).where(eq(users.id, userId));
}

/**
 * Create a new ticket
 */
export async function createTicket(ticket: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create ticket: database not available");
    return null;
  }

  const result = await db.insert(tickets).values(ticket);
  return result;
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ticket: database not available");
    return undefined;
  }

  const result = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all tickets for a user
 */
export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tickets: database not available");
    return [];
  }

  return await db.select().from(tickets).where(eq(tickets.userId, userId));
}

/**
 * Get all tickets (for admin)
 */
export async function getAllTickets() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tickets: database not available");
    return [];
  }

  return await db.select().from(tickets);
}

/**
 * Update ticket status and payment info
 */
export async function updateTicketPayment(ticketId: number, paymentId: string, paymentStatus: "confirmed" | "failed") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ticket: database not available");
    return;
  }

  const status = paymentStatus === "confirmed" ? "paid" : "pending";
  await db.update(tickets).set({
    paymentId,
    paymentStatus,
    status,
  }).where(eq(tickets.id, ticketId));
}

/**
 * Update ticket with corrected file
 */
export async function updateTicketCorrectedFile(ticketId: number, filePath: string, fileName: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ticket: database not available");
    return;
  }

  await db.update(tickets).set({
    correctedFilePath: filePath,
    correctedFileName: fileName,
  }).where(eq(tickets.id, ticketId));
}

/**
 * Mark ticket as delivered
 */
export async function markTicketAsDelivered(ticketId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ticket: database not available");
    return;
  }

  await db.update(tickets).set({
    isDelivered: true,
    status: "completed",
    completedAt: new Date(),
  }).where(eq(tickets.id, ticketId));
}

/**
 * Add chat message
 */
export async function addChatMessage(message: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add message: database not available");
    return null;
  }

  const result = await db.insert(chatMessages).values(message);
  return result;
}

/**
 * Get chat messages for a ticket
 */
export async function getTicketChatMessages(ticketId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  return await db.select().from(chatMessages).where(eq(chatMessages.ticketId, ticketId));
}

/**
 * Add admin log
 */
export async function addAdminLog(log: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add log: database not available");
    return;
  }

  await db.insert(adminLogs).values(log);
}

/**
 * Get system setting
 */
export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get setting: database not available");
    return undefined;
  }

  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : undefined;
}

/**
 * Update system setting
 */
export async function updateSystemSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update setting: database not available");
    return;
  }

  await db.insert(systemSettings).values({ settingKey: key, settingValue: value }).onDuplicateKeyUpdate({
    set: { settingValue: value },
  });
}
