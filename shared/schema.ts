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
  { id: 1, name: "Я принимаю решение каждый день благодарить Всевышнего за хорошие вещи и читать 100-й псалом Теилим", icon: "Guitar" },
  { id: 2, name: "Я принимаю решение каждый день читать свой личный псалом и псалом своих детей по возрасту", icon: "Music2" },
  { id: 3, name: "Я принимаю решение соблюдать 4 заповеди праздника Пурим: слушание чтения Свитка Эстер, праздничный пир, съестные подарки друзьям и подарки бедным", icon: "Music3" },
  { id: 4, name: "Я принимаю решение сделать дома атмосферу Шаббата: накрою праздничный стол и зажгу субботние свечи вовремя", icon: "Drum" },
  { id: 5, name: "Я принимаю решение слушать хасидский нигун раз в неделю", icon: "Music4" },
] as const;