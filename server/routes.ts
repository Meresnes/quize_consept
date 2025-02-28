import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertVoteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Broadcast vote counts to all connected clients
  async function broadcastVoteCounts() {
    const counts = await storage.getVoteCount();
    const message = JSON.stringify({type: "voteCounts", data: counts});
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Ошибка сервера" });
      }
    }
  });

  app.post("/api/vote", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      const user = await storage.getUser(voteData.userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      if (user.hasVoted) {
        return res.status(400).json({ error: "Вы уже выбрали вариант ответа" });
      }

      await storage.createVote(voteData);
      await storage.markUserVoted(voteData.userId);
      await broadcastVoteCounts();

      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Ошибка сервера" });
      }
    }
  });

  app.get("/api/votes", async (_req, res) => {
    const counts = await storage.getVoteCount();
    res.json(counts);
  });

  app.get("/api/users", async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Broadcast initial vote counts when clients connect
  wss.on("connection", async (ws) => {
    const counts = await storage.getVoteCount();
    ws.send(JSON.stringify({ type: "voteCounts", data: counts }));
  });

  return httpServer;
}