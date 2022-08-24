import { createRouter } from '../createRouter';
import { postRouter } from './post';
import { fandomRouter } from './fandom';
import superjson from 'superjson';

export const appRouter = createRouter()
  .transformer(superjson)

  .query('healthz', {
    async resolve() {
      return 'yay!';
    },
  })
  .merge('fandom.', fandomRouter);

export type AppRouter = typeof appRouter;
