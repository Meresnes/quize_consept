import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  hasVoted: boolean("has_voted").default(false).notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  optionIds: integer("option_ids").array().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  phone: true,
}).extend({
  fullName: z.string().min(2,"Неверно указно ФИО").max(100,"Неверно указно ФИО"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Неверно указа номер телефона"),
});

export const insertVoteSchema = createInsertSchema(votes).extend({
  optionIds: z.array(z.number()).min(1, "Пожалуйста, выберите хотя бы один вариант"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type User = typeof users.$inferSelect;
export type Vote = typeof votes.$inferSelect;

export const VOTE_OPTIONS = [
  { id: 1, name: "Я решаю слушать хасидский нигун раз в неделю", icon: "Music4" },
  { id: 2, name: "Каждый день благодарить за 3 хорошие вещи, которые произошли со мной в течение дня и читать 100-й псалом Теилим", icon: "Guitar" },
  { id: 3, name: "Каждый день читать свой личный псалом и псалом своих детей по возрасту", icon: "Music2" },
  { id: 4, name: "Я буду соблюдать 4 заповеди праздника Пурим: слушание чтения Свитка Эстер, праздничный пир, подарю подарки бедным и съестные подарки друзьям", icon: "Music3" },
  { id: 5, name: "Я сделаю дома атмосферу Шабата: буду накрывать празднично стол и зажгу субботние свечи вовремя", icon: "Drum" },
] as const;