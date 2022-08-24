import fetch from 'cross-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PokemonData {
  name: string;
  sprites: {
    other: {
      dream_world: {
        front_default: string;
      };
    };
  };
}

async function main() {
  const fandom = await prisma.fandom.upsert({
    where: {
      slug: 'pokemon',
    },
    create: {
      slug: 'pokemon',
      name: 'Pokemon',
    },
    update: {},
  });
  let i = 1;
  while (true) {
    const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const pokemonData = (await pokemon.json()) as PokemonData;
    console.dir(pokemonData);
    const name = pokemonData.name;
    const imageUrl = pokemonData.sprites.other.dream_world.front_default;

    if (imageUrl) {
      await prisma.fandomItem.upsert({
        where: {
          id: i.toString(),
        },
        create: {
          id: i.toString(),
          name,
          imageUrl,
          rating: 0,
          fandom: {
            connect: {
              slug: 'pokemon',
            },
          },
        },
        update: {},
      });
    } else {
      break;
    }
    i++;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
