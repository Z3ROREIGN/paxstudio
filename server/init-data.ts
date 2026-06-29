import * as db from "./db";
import { hashPassword } from "./_core/oauth";

/**
 * Initialize database with pre-created support account
 */
export async function initializeData() {
  try {
    // Check if support account already exists
    const supportUser = await db.getUserByEmail("willianwca2011@gmail.com");
    
    if (!supportUser) {
      console.log("[Init] Creating pre-configured support account...");
      
      const passwordHash = await hashPassword("willian72011");
      
      await db.upsertUser({
        email: "willianwca2011@gmail.com",
        name: "Support Team",
        passwordHash,
        role: "admin",
      });
      
      console.log("[Init] Support account created successfully");
    } else {
      console.log("[Init] Support account already exists");
    }
  } catch (error) {
    console.error("[Init] Failed to initialize data:", error);
  }
}
