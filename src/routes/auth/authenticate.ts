import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../../env';
import { knex } from '../../database';

export async function AuthenticateRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const newUserSchema = z.object({
        username: z.string(),
        password: z.string(),
      });

      const { username, password } = newUserSchema.parse(request.body);

      const isUsernameAlreadyExists = await knex('users')
        .where({ username: username })
        .first();

      if (isUsernameAlreadyExists)
        return reply.status(401).send('User already exists.');
      else {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
          await knex('users').insert({
            id: randomUUID(),
            username,
            password: hashedPassword,
          });
          return reply.status(201).send();
        } catch (error) {
          return reply.status(401).send();
        }
      }
    }
  );

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const userLoginSchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = userLoginSchema.parse(request.body);

    //Wrong input user
    const user = await knex('users').where({ username }).first();
    if (!user) return reply.status(404).send('User not exist.');

    //Wrong input password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return reply.status(404).send('Wrong password.');

    //Sign the jwt with user id
    const token = jwt.sign({ userId: user.id }, env.SECRET);

    return reply.status(201).send({
      data: {
        token,
      },
    });
  });
}

export async function Authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const tokenHeader = request.headers['authorization'];
  const token = tokenHeader && tokenHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, env.SECRET);
  } else {
    return reply.status(401).send('Not authorizated.');
  }
}
