import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { comparePassword, hashPassword } from "./_core/oauth";
import { createPayment } from "./mistickpay";
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
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Email already registered");
        }
        const passwordHash = await hashPassword(input.password);
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
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }
        if (user.isBanned) {
          throw new Error("User is banned");
        }
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

  tickets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTickets(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Access denied");
        }
        return ticket;
      }),

    initiatePayment: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.userId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        if (ticket.paymentStatus === "confirmed") {
          throw new Error("Payment already confirmed");
        }
        const payment = await createPayment({
          ticketId: ticket.id,
          amount: parseFloat(ticket.amount),
          clientEmail: ctx.user.email,
          clientName: ctx.user.name,
          description: `Code support for ${ticket.fileName}`,
        });
        await db.updateTicketPayment(ticket.id, payment.paymentId, "pending" as any);
        return {
          paymentId: payment.paymentId,
          paymentUrl: payment.paymentUrl,
          status: payment.status,
        };
      }),

    confirmPayment: protectedProcedure
      .input(z.object({ ticketId: z.number(), paymentId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Access denied");
        }
        await db.updateTicketPayment(input.ticketId, input.paymentId, "confirmed");
        return { success: true };
      }),
  }),

  chat: router({
    messages: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Access denied");
        }
        if (ticket.paymentStatus !== "confirmed" && ctx.user.role !== "admin") {
          throw new Error("Payment required to access chat");
        }
        return await db.getTicketChatMessages(input.ticketId);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Access denied");
        }
        if (ticket.paymentStatus !== "confirmed" && ctx.user.role !== "admin") {
          throw new Error("Payment required to access chat");
        }
        await db.addChatMessage({
          ticketId: input.ticketId,
          userId: ctx.user.id,
          messageType: "text",
          content: input.message,
        });
        return { success: true };
      }),
  }),

  admin: router({
    listTickets: adminProcedure.query(async () => {
      return await db.getAllTickets();
    }),

    listUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    toggleUserBan: adminProcedure
      .input(z.object({ userId: z.number(), isBanned: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (input.userId === ctx.user.id) {
          throw new Error("Cannot ban yourself");
        }
        await db.updateUserBanStatus(input.userId, input.isBanned);
        await db.addAdminLog({
          adminId: ctx.user.id,
          action: input.isBanned ? "ban_user" : "unban_user",
          targetUserId: input.userId,
          details: `User ${input.isBanned ? "banned" : "unbanned"} by admin`,
        });
        return { success: true };
      }),

    completeTicket: adminProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        await db.markTicketAsDelivered(input.ticketId);
        await db.addAdminLog({
          adminId: ctx.user.id,
          action: "complete_ticket",
          targetTicketId: input.ticketId,
          details: `Ticket ${input.ticketId} marked as completed`,
        });
        return { success: true };
      }),

    getSetting: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getSystemSetting(input.key);
        return { key: input.key, value: value ?? null };
      }),

    updateSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateSystemSetting(input.key, input.value);
        await db.addAdminLog({
          adminId: ctx.user.id,
          action: "update_setting",
          details: `Setting "${input.key}" updated`,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
