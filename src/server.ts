import { env } from '../env';
import { app } from './app';

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Daily Diet APP is running!');
  });
