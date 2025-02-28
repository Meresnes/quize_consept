import Database from "better-sqlite3";
import { User, Vote, InsertUser, InsertVote } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import path from "path";

const MemoryStore = createMemoryStore(session);
const DB_PATH = path.join(process.cwd(), "storage.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  phone TEXT NOT NULL,
  hasVoted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS votes (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   userId INTEGER NOT NULL,
   optionIds TEXT NOT NULL
  );
`);

export type VoteCountWithUsers = Record<
    number,
    { count: number; voters: User[] }
>;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteCount(): Promise<VoteCountWithUsers>;
  markUserVoted(userId: number): Promise<void>;
  sessionStore: session.Store;
}

export class SQLiteStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const stmt = db.prepare("INSERT INTO users (fullName, phone, hasVoted) VALUES (?, ?, 0)");
      const result = stmt.run(user.fullName, user.phone);
      return db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return db.prepare("SELECT * FROM users").all();
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    try {
      const stmt = db.prepare("INSERT INTO votes (userId, optionIds) VALUES (?, ?)");
      const result = stmt.run(vote.userId, JSON.stringify(vote.optionIds));
      const newVote = db.prepare("SELECT * FROM votes WHERE id = ?").get(result.lastInsertRowid);
      return { ...newVote, optionIds: JSON.parse(newVote.optionIds) } as Vote;
    } catch (error) {
      console.error("Error creating vote:", error);
      throw error;
    }
  }

  async getVoteCount(): Promise<VoteCountWithUsers> {
    const votes = db.prepare("SELECT v.optionIds, u.id AS userId, u.fullName, u.phone FROM votes v JOIN users u ON v.userId = u.id").all();
    const counts: VoteCountWithUsers = {};

    for (const vote of votes) {
      try {
        const optionIds = JSON.parse(vote.optionIds);
        const user = { id: vote.userId, fullName: vote.fullName, phone: vote.phone, hasVoted: true }; // Создаем объект пользователя
        for (const id of optionIds) {
          if (!counts[id]) {
            counts[id] = { count: 0, voters: [] };
          }
          counts[id].count++;
          //проверяем есть ли уже пользователь в массиве, чтобы не дублировать
          if (!counts[id].voters.some(voter => voter.id === user.id)) {
            counts[id].voters.push(user);
          }

        }
      } catch (error) {
        console.error("Error parsing vote:", error);
      }
    }
    return counts;
  }

  async markUserVoted(userId: number): Promise<void> {
    try {
      db.prepare("UPDATE users SET hasVoted = 1 WHERE id = ?").run(userId);
    } catch (error) {
      console.error("Error marking user as voted:", error);
    }
  }
}

export const storage = new SQLiteStorage();