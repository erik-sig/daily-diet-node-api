import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { decodeJWT } from '../utils/decodeJWT';
import { Authenticate } from './auth/authenticate';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const idSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = idSchema.parse(request.params);

    try {
      const user = await knex('users').where(id).first();
      return { user };
    } catch (error) {
      return reply.status(401).send();
    }
  });

  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await knex('users').select('*');

    return { users };
  });

  app.get(
    '/metrics',
    { preHandler: [Authenticate] },
    async (request, reply) => {
      const tokenHeader = request.headers['authorization'];
      const token = tokenHeader && tokenHeader.split(' ')[1];

      //decodeJWT to get userID
      const userId = await decodeJWT(token as string);

      try {
        const userMeals = await knex('meals')
          .where({ author: userId })
          .select('*');

        let mealsOnDietQnt = 0;
        let mealsOffDietQnt = 0;
        let bestSequenceOfMealsOnDiet = 0;

        for (let x in userMeals) {
          if (userMeals[x].is_on_diet) mealsOnDietQnt++;
          else mealsOffDietQnt++;
          if (userMeals[x].is_on_diet) bestSequenceOfMealsOnDiet++;
          else bestSequenceOfMealsOnDiet = 0;
        }

        const metricsObject = {
          mealsQuantity: userMeals.length,
          mealsOnDietQnt,
          mealsOffDietQnt,
          bestSequenceOfMealsOnDiet,
        };
        return metricsObject;
      } catch (error) {
        return reply.status(404).send('Error to get metrics of user.');
      }
    }
  );
}
