import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { comparePassword, hashPassword } from "./_core/oauth";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Email already registered");
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        await db.upsertUser({
          email: input.email,
          name: input.name,
          passwordHash,
          role: "user",
        });

        const newUser = await db.getUserByEmail(input.email);
        if (!newUser) {
          throw new Error("Failed to create user");
        }

        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          },
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.isBanned) {
          throw new Error("User is banned");
        }

        // Compare password
        const isPasswordValid = await comparePassword(input.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
  }),

  // TODO: add feature routers here
});

export type AppRouter = typeof appRouter;
