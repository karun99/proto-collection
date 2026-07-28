import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  numeric,
  jsonb,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "tutor"]);
export const teachingModeEnum = pgEnum("teachingMode", ["online", "in-person", "hybrid"]);
export const questionTypeEnum = pgEnum("questionType", ["mcq", "true_false", "short_answer"]);
export const fileTypeEnum = pgEnum("fileType", ["pdf", "epub"]);
export const jobTypeEnum = pgEnum("jobType", ["import", "export"]);
export const jobStatusEnum = pgEnum("status", ["pending", "processing", "completed", "failed"]);
export const formatEnum = pgEnum("format", ["csv", "json"]);

/**
 * Platform settings for Admin branding and theming.
 */
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  themeMode: varchar("themeMode", { length: 20 }).default("light"),
  primaryColor: varchar("primaryColor", { length: 50 }).default("#0056b3"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  platformName: varchar("platformName", { length: 100 }).default("TutorConnect"),
  additionalConfig: jsonb("additionalConfig").default({}),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Tutors table - Extended profile information for tutors
 */
export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  bio: text("bio"),
  subjects: jsonb("subjects").default([]),
  locationText: varchar("locationText", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  teachingMode: teachingModeEnum("teachingMode").default("online"),
  priceMin: integer("priceMin"),
  priceMax: integer("priceMax"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("ratingCount").default(0),
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  availability: jsonb("availability"),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 20 }),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Tutor settings - API keys and preferences (encrypted)
 */
export const tutorSettings = pgTable("tutor_settings", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  encryptedOpenRouterKey: text("encryptedOpenRouterKey"),
  preferredModel: varchar("preferredModel", { length: 255 }),
  availableModels: jsonb("availableModels").default([]),
  modelConfigs: jsonb("modelConfigs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Flyers - Digital marketing flyers created by tutors
 */
export const flyers = pgTable("flyers", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  template: varchar("template", { length: 100 }),
  content: text("content"), // JSON stringified canvas data
  imageUrl: varchar("imageUrl", { length: 500 }),
  downloadCount: integer("downloadCount").default(0),
  isPublished: boolean("isPublished").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Quizzes - Quiz metadata and configuration
 */
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  timeLimitMinutes: integer("timeLimitMinutes"),
  passingPercentage: integer("passingPercentage").default(60),
  shuffleQuestions: boolean("shuffleQuestions").default(false),
  isPublished: boolean("isPublished").default(false),
  aiGenerated: boolean("aiGenerated").default(false),
  modelUsed: varchar("modelUsed", { length: 255 }),
  attemptCount: integer("attemptCount").default(0),
  averageScore: numeric("averageScore", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Questions - Individual quiz questions
 */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quizId").notNull(),
  questionType: questionTypeEnum("questionType").notNull(),
  questionText: text("questionText").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1),
  orderIndex: integer("orderIndex"),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Question options - MCQ options
 */
export const questionOptions = pgTable("question_options", {
  id: serial("id").primaryKey(),
  questionId: integer("questionId").notNull(),
  optionText: text("optionText").notNull(),
  isCorrect: boolean("isCorrect").default(false),
  orderIndex: integer("orderIndex"),
});

/**
 * Quiz attempts - Student quiz attempts and scores
 */
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quizId").notNull(),
  studentId: integer("studentId"),
  studentEmail: varchar("studentEmail", { length: 320 }),
  score: integer("score"),
  totalQuestions: integer("totalQuestions"),
  passed: boolean("passed"),
  timeSeconds: integer("timeSeconds"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Student answers - Individual student answers
 */
export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attemptId").notNull(),
  questionId: integer("questionId").notNull(),
  selectedOptionId: integer("selectedOptionId"),
  selectedText: text("selectedText"),
  isCorrect: boolean("isCorrect"),
  answeredAt: timestamp("answeredAt"),
});

/**
 * Ebooks - Digital learning materials
 */
export const ebooks = pgTable("ebooks", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 500 }),
  fileType: fileTypeEnum("fileType").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  isFree: boolean("isFree").default(true),
  isPublished: boolean("isPublished").default(false),
  downloadCount: integer("downloadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * AI generation logs - Track AI API usage
 */
export const aiGenerationLogs = pgTable("ai_generation_logs", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  modelUsed: varchar("modelUsed", { length: 255 }),
  promptTokens: integer("promptTokens"),
  completionTokens: integer("completionTokens"),
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 6 }),
  generationType: varchar("generationType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Data import/export jobs - Track bulk operations
 */
export const dataJobs = pgTable("data_jobs", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutorId").notNull(),
  jobType: jobTypeEnum("jobType").notNull(),
  dataType: varchar("dataType", { length: 100 }),
  format: formatEnum("format").notNull(),
  status: jobStatusEnum("status").default("pending"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  recordCount: integer("recordCount"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * No-code resources - Curated tools and guides
 */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  isFree: boolean("isFree").default(true),
  logoUrl: varchar("logoUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
