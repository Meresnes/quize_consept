import Database from "better-sqlite3";
import { User, Vote, InsertUser, InsertVote } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import path from "path";
import {STATUS} from "@/types/status";

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

  CREATE TABLE IF NOT EXISTS registration_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED'))
    );
  INSERT INTO registration_status (status) SELECT 'OPEN' WHERE NOT EXISTS (SELECT 1 FROM registration_status);
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
  getRegistrationStatus(): Promise<STATUS>;
  setRegistrationStatus(status: STATUS): Promise<void>;
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
        const user = { id: vote.userId, fullName: vote.fullName, phone: vote.phone, hasVoted: true };
        for (const id of optionIds) {
          if (!counts[id]) {
            counts[id] = { count: 0, voters: [] };
          }
          counts[id].count++;
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

  async getRegistrationStatus(): Promise<STATUS> {
    try {
      const result = db.prepare("SELECT status FROM registration_status LIMIT 1").get() as { status: STATUS } | undefined;
      if (!result) {
        throw new Error("Registration status not found");
      }
      return result.status;
    } catch (error) {
      throw error;
    }
  }

  async setRegistrationStatus(status: STATUS): Promise<void> {
    try {
      const result = db.prepare("UPDATE registration_status SET status = ?").run(status);
      if (result.changes === 0) {
        throw new Error(`Failed to update registration status to ${status}`);
      }
    } catch (error) {
      throw error;
    }
  }
}

export const storage = new SQLiteStorage();