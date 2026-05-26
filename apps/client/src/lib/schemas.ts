import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
})

export const binSchema = z.object({
  name: z.string().trim().min(1, "Kit name is required"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().optional(),
  providerTags: z.array(z.string().trim().min(1)).default([]),
})

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required"),
  description: z.string().optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type BinSchema = z.infer<typeof binSchema>
export type ItemSchema = z.infer<typeof itemSchema>

export const kioskPinSchema = z.object({
  pin: z
    .string()
    .trim()
    .min(4, "PIN must be at least 4 digits")
    .max(32, "PIN is too long")
    .regex(/^\d+$/, "PIN must contain only numbers"),
})

export type KioskPinSchema = z.infer<typeof kioskPinSchema>
