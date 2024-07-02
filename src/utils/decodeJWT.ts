import jwt from 'jsonwebtoken';
import { z } from 'zod';

const userIdSchema = z.object({
  userId: z.string().uuid(),
});

export async function decodeJWT(token: string) {
  const userData = jwt.decode(token as string);
  if (!userData) return;
  const { userId } = userIdSchema.parse(userData);
  return userId;
}
