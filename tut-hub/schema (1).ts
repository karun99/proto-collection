import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  longtext,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with tutor-specific fields for the TutorConnect platform.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "tutor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tutors table - Extended profile information for tutors
 */
export const tutors = mysqlTable("tutors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bio: longtext("bio"),
  subjects: json("subjects").$type<string[]>().default([]),
  locationText: varchar("locationText", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  teachingMode: mysqlEnum("teachingMode", ["online", "in-person", "hybrid"]).default("online"),
  priceMin: int("priceMin"),
  priceMax: int("priceMax"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: int("ratingCount").default(0),
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  availability: json("availability").$type<Record<string, string[]>>(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 20 }),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = typeof tutors.$inferInsert;

/**
 * Tutor settings - API keys and preferences (encrypted)
 */
export const tutorSettings = mysqlTable("tutor_settings", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  encryptedOpenRouterKey: longtext("encryptedOpenRouterKey"),
  preferredModel: varchar("preferredModel", { length: 255 }),
  availableModels: json("availableModels").$type<string[]>().default([]),
  modelConfigs: json("modelConfigs").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutorSettings = typeof tutorSettings.$inferSelect;
export type InsertTutorSettings = typeof tutorSettings.$inferInsert;

/**
 * Flyers - Digital marketing flyers created by tutors
 */
export const flyers = mysqlTable("flyers", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  template: varchar("template", { length: 100 }),
  content: longtext("content"), // JSON stringified canvas data
  imageUrl: varchar("imageUrl", { length: 500 }),
  downloadCount: int("downloadCount").default(0),
  isPublished: boolean("isPublished").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flyer = typeof flyers.$inferSelect;
export type InsertFlyer = typeof flyers.$inferInsert;

/**
 * Quizzes - Quiz metadata and configuration
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  description: longtext("description"),
  timeLimitMinutes: int("timeLimitMinutes"),
  passingPercentage: int("passingPercentage").default(60),
  shuffleQuestions: boolean("shuffleQuestions").default(false),
  isPublished: boolean("isPublished").default(false),
  aiGenerated: boolean("aiGenerated").default(false),
  modelUsed: varchar("modelUsed", { length: 255 }),
  attemptCount: int("attemptCount").default(0),
  averageScore: decimal("averageScore", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Questions - Individual quiz questions
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  questionType: mysqlEnum("questionType", ["mcq", "true_false", "short_answer"]).notNull(),
  questionText: longtext("questionText").notNull(),
  explanation: longtext("explanation"),
  points: int("points").default(1),
  orderIndex: int("orderIndex"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Question options - MCQ options
 */
export const questionOptions = mysqlTable("question_options", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  optionText: longtext("optionText").notNull(),
  isCorrect: boolean("isCorrect").default(false),
  orderIndex: int("orderIndex"),
});

export type QuestionOption = typeof questionOptions.$inferSelect;
export type InsertQuestionOption = typeof questionOptions.$inferInsert;

/**
 * Quiz attempts - Student quiz attempts and scores
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  studentId: int("studentId"),
  studentEmail: varchar("studentEmail", { length: 320 }),
  score: int("score"),
  totalQuestions: int("totalQuestions"),
  passed: boolean("passed"),
  timeSeconds: int("timeSeconds"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Student answers - Individual student answers
 */
export const studentAnswers = mysqlTable("student_answers", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  selectedOptionId: int("selectedOptionId"),
  selectedText: longtext("selectedText"),
  isCorrect: boolean("isCorrect"),
  answeredAt: timestamp("answeredAt"),
});

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type InsertStudentAnswer = typeof studentAnswers.$inferInsert;

/**
 * Ebooks - Digital learning materials
 */
export const ebooks = mysqlTable("ebooks", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  description: longtext("description"),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 500 }),
  fileType: mysqlEnum("fileType", ["pdf", "epub"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  isFree: boolean("isFree").default(true),
  isPublished: boolean("isPublished").default(false),
  downloadCount: int("downloadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;

/**
 * AI generation logs - Track AI API usage
 */
export const aiGenerationLogs = mysqlTable("ai_generation_logs", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  modelUsed: varchar("modelUsed", { length: 255 }),
  promptTokens: int("promptTokens"),
  completionTokens: int("completionTokens"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 6 }),
  generationType: varchar("generationType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIGenerationLog = typeof aiGenerationLogs.$inferSelect;
export type InsertAIGenerationLog = typeof aiGenerationLogs.$inferInsert;

/**
 * Data import/export jobs - Track bulk operations
 */
export const dataJobs = mysqlTable("data_jobs", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  jobType: mysqlEnum("jobType", ["import", "export"]).notNull(),
  dataType: varchar("dataType", { length: 100 }),
  format: mysqlEnum("format", ["csv", "json"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  recordCount: int("recordCount"),
  errorMessage: longtext("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataJob = typeof dataJobs.$inferSelect;
export type InsertDataJob = typeof dataJobs.$inferInsert;

/**
 * No-code resources - Curated tools and guides
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: longtext("description"),
  url: varchar("url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  isFree: boolean("isFree").default(true),
  logoUrl: varchar("logoUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
