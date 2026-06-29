import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import bcrypt from "bcryptjs";

function getBodyParam(body: any, key: string): string | undefined {
  const value = body?.[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function registerAuthRoutes(app: Express) {
  /**
   * Register new user
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const email = getBodyParam(req.body, "email");
      const name = getBodyParam(req.body, "name");
      const password = getBodyParam(req.body, "password");

      if (!email || !name || !password) {
        res.status(400).json({ error: "email, name, and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      await db.upsertUser({
        email,
        name,
        passwordHash,
        role: "user",
      });

      const newUser = await db.getUserByEmail(email);
      if (!newUser) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(
        newUser.id,
        newUser.email,
        newUser.role,
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * Login user
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const email = getBodyParam(req.body, "email");
      const password = getBodyParam(req.body, "password");

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      if (user.isBanned) {
        res.status(403).json({ error: "User is banned" });
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(
        user.id,
        user.email,
        user.role,
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
