import * as trpc from '@trpc/server';
import { resolve } from 'path';
import { z } from 'zod';
import { prisma } from '../prisma';

const getRandomWithExclusion: (range: number, exclude?: number) => number = (
  range,
  exclude,
) => {
  const random = Math.floor(Math.random() * range) + 1;
  if (random !== exclude) return random;
  return getRandomWithExclusion(range, exclude);
};

export const fandomRouter = trpc
  .router()
  .query('all', {
    async resolve() {
      return await prisma.fandom.findMany();
    },
  })
  .query('by-slug', {
    input: z.string(),
    async resolve({ input }) {
      const fandom = await prisma.fandom.findOne({
        where: { input },
      });
      return fandom;
    },
  })
  .query('get-pair', {
    input: z.string(),
    async resolve({ input }) {
      const count = await prisma.fandomItem.count({
        where: { fandom: { slug: input } },
      });
      const a = getRandomWithExclusion(count);
      const b = getRandomWithExclusion(count, a);
      const fandomItemA = await prisma.fandomItem.findFirst({
        where: {
          fandom: { slug: input },
          id: a.toString(),
        },
      });
      const fandomItemB = await prisma.fandomItem.findFirst({
        where: {
          fandom: { slug: input },
          id: b.toString(),
        },
      });

      return [fandomItemA, fandomItemB];
    },
  })
  .mutation('cast-vote', {
    input: z.object({
      votedFor: z.string(),
      votedAgainst: z.string(),
    }),
    async resolve({ input }) {
      const voteInDb = await prisma.vote.create({
        data: {
          votedAgainstId: input.votedAgainst,
          votedForId: input.votedFor,
        },
      });
      return { success: true, vote: voteInDb };
    },
  });
