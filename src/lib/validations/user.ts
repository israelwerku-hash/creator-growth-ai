import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().int("Age must be an integer").min(13, "Must be at least 13 years old").max(120, "Age seems invalid"),
  aiCredits: z.number().int("Credits must be an integer").min(0, "Credits cannot be negative"),
  role: z.enum(["CREATOR", "MANAGER", "ADMIN"]).optional(),
});

export type UserProfileUpdate = z.infer<typeof userProfileSchema>;
