import { z } from 'zod';

// Member validation schema
export const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  role: z
    .string()
    .trim()
    .max(30, 'Role must be less than 30 characters')
    .optional()
    .or(z.literal('')),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be less than 120')
    .optional(),
  room: z
    .string()
    .trim()
    .max(50, 'Room name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Please select a valid color'),
});

// Task validation schema
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(100, 'Task title must be less than 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  assignedTo: z
    .string()
    .min(1, 'Please assign this task to a member'),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Please select a valid priority' }),
    }),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  dueDate: z
    .string()
    .min(1, 'Due date is required'),
});

// Household validation schema
export const householdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Household name must be at least 2 characters')
    .max(50, 'Household name must be less than 50 characters'),
  numberOfRooms: z
    .number()
    .int('Number of rooms must be a whole number')
    .min(1, 'Must have at least 1 room')
    .max(50, 'Number of rooms cannot exceed 50'),
  houseSize: z
    .number()
    .min(10, 'House size must be at least 10 m²')
    .max(10000, 'House size cannot exceed 10,000 m²'),
  numberOfFloors: z
    .number()
    .int('Number of floors must be a whole number')
    .min(1, 'Must have at least 1 floor')
    .max(20, 'Number of floors cannot exceed 20'),
  address: z
    .string()
    .trim()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  houseType: z
    .enum(['apartment', 'house', 'studio', 'villa', 'other'], {
      errorMap: () => ({ message: 'Please select a valid house type' }),
    })
    .optional(),
  hasGarden: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  hasBasement: z.boolean().optional(),
  hasAttic: z.boolean().optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

// Type exports
export type MemberFormData = z.infer<typeof memberSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type HouseholdFormData = z.infer<typeof householdSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Helper function to format zod errors
export const formatZodErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      errors[err.path[0]] = err.message;
    }
  });
  return errors;
}; 