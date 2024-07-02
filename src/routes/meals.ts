import { randomUUID } from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { decodeJWT } from '../utils/decodeJWT';
import { Authenticate } from './auth/authenticate';

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/new',
    { preHandler: [Authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
        author: z.string(),
      });
      const { name, description, is_on_diet, author } = createMealSchema.parse(
        request.body
      );

      try {
        await knex('meals').insert({
          meal_id: randomUUID(),
          name,
          description,
          is_on_diet,
          author,
        });
        return reply.status(201).send('Meal created successfully.');
      } catch (error) {
        return reply.status(404).send('Error to create meal.');
      }
    }
  );

  app.get(
    '/:meal_id',
    { preHandler: [Authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const mealIdSchema = z.object({
        meal_id: z.string().uuid(),
      });
      const { meal_id } = mealIdSchema.parse(request.params);

      //get token to get userID
      const tokenHeader = request.headers['authorization'];
      const token = tokenHeader && tokenHeader.split(' ')[1];

      //decodeJWT to get userID
      const userId = await decodeJWT(token as string);

      try {
        const userMeal = await knex('meals')
          .where({ meal_id, author: userId })
          .first();

        return { userMeal };
      } catch (error) {
        return reply.status(404).send('Error to get the user meals.');
      }
    }
  );

  app.patch(
    '/:meal_id',
    { preHandler: [Authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const mealIdSchema = z.object({
        meal_id: z.string().uuid(),
      });
      const updateMealSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        is_on_diet: z.boolean().optional(),
      });
      const { name, description, is_on_diet } = updateMealSchema.parse(
        request.body
      );
      const { meal_id } = mealIdSchema.parse(request.params);

      //get token to get userID
      const tokenHeader = request.headers['authorization'];
      const token = tokenHeader && tokenHeader.split(' ')[1];

      //decodeJWT to get userID
      const userId = await decodeJWT(token as string);

      try {
        await knex('meals').where({ meal_id, author: userId }).update({
          name,
          description,
          is_on_diet,
        });
        return reply.status(201).send('Updated successfully.');
      } catch (error) {
        return reply.status(400).send();
      }
    }
  );
  app.get(
    '/',
    { preHandler: [Authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tokenHeader = request.headers['authorization'];
      const token = tokenHeader && tokenHeader.split(' ')[1];

      //decodeJWT to get userID
      const userId = await decodeJWT(token as string);

      try {
        const userMeals = await knex('meals')
          .where({ author: userId })
          .select('*');
        return { userMeals };
      } catch (error) {
        return reply.status(404).send('Cannot get all meals.');
      }
    }
  );

  app.delete('/:meal_id', async (request, reply) => {
    const mealIdSchema = z.object({
      meal_id: z.string().uuid(),
    });
    const { meal_id } = mealIdSchema.parse(request.params);

    const tokenHeader = request.headers['authorization'];
    const token = tokenHeader && tokenHeader.split(' ')[1];

    //decodeJWT to get userID
    const userId = await decodeJWT(token as string);

    try {
      await knex('meals').where({ meal_id, author: userId }).del();
      return reply.status(200).send('Deleted successfully.');
    } catch (error) {
      return reply.status(400).send();
    }
  });
}
