import fastify from 'fastify';
import { AuthenticateRoutes } from './routes/auth/authenticate';
import { mealsRoutes } from './routes/meals';
import { usersRoutes } from './routes/users';

export const app = fastify();

app.register(AuthenticateRoutes);
app.register(usersRoutes, { prefix: 'users' });
app.register(mealsRoutes, { prefix: 'meals' });
