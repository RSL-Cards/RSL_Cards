import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['dealer', 'consumer']).optional().default('consumer')
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const RefreshSchema = z.object({
  refreshToken: z.string()
});

export const LogoutSchema = z.object({
  refreshToken: z.string().optional()
});

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshBody = z.infer<typeof RefreshSchema>;
export type LogoutBody = z.infer<typeof LogoutSchema>;
