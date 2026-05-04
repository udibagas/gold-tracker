import type { Context } from "elysia";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password using bcrypt
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Extract user from JWT token
export function getUserFromToken(context: Context & { jwt: any }) {
  return context.jwt;
}
