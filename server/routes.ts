import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {insertUserSchema, insertVoteSchema, User} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import {STATUS} from "@/types/status";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

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
      const currentStatus = await storage.getRegistrationStatus();
      if (currentStatus === STATUS.CLOSED) {
        return res.status(403).json({ error: "Регистрация закрыта" });
      }
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getAllUsers()
          .then((users: User[])  => {
            return users.some((user: User) => user.phone === userData.phone && user.hasVoted);
          })
      if (existingUser) {
        return res.status(409).json({ message: "Пользователь с таким номером телефона уже зарегистрирован." });
      }

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


  app.get("/api/registration-status", async (req, res) => {
    try {
      const status = await storage.getRegistrationStatus();
      res.status(200).json({ status });
    } catch (error) {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

  app.post("/api/registration-status", async (req, res) => {
    try {
      const { status } = req.body;

      if (status !== STATUS.OPEN && status !== STATUS.CLOSED) {
        console.error("Ошибка: Неправильный статус", status);
        return res.status(400).json({ error: "Неправильный статус" });
      }

      await storage.setRegistrationStatus(status);
      res.status(200).json({ status });
    } catch (error) {
      console.error("Ошибка при обновлении статуса регистрации:", error);
      res.status(500).json({ error: error.message || "Ошибка сервера" });
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