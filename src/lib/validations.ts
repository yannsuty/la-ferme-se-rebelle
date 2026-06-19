import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
});

export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
  name: z.string().min(2, "Nom requis"),
  role: z.enum(["OWNER", "EMPLOYEE"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["OWNER", "EMPLOYEE"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const pastureSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  type: z.enum(["PASTURE", "FIELD"]),
  description: z.string().optional(),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const grazingAssignmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  session: z.enum(["MORNING", "EVENING"]),
  pastureId: z.string().min(1),
  notes: z.string().optional(),
});

export const createFarmSchema = z.object({
  name: z.string().min(2, "Nom requis").max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide")
    .max(60)
    .optional(),
});

export const updateFarmSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  active: z.boolean().optional(),
});

export const databaseResetSchema = z.object({
  confirmation: z.literal("REINITIALISER"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type PastureInput = z.infer<typeof pastureSchema>;
export type GrazingAssignmentInput = z.infer<typeof grazingAssignmentSchema>;
export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
