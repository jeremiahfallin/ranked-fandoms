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

async function insertPokemon() {
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
      console.log(i);
      break;
    }
    i++;
  }
}

async function insertAnimalCrossing() {
  const fandom = await prisma.fandom.upsert({
    where: {
      slug: 'animal-crossing',
    },
    create: {
      slug: 'animal-crossing',
      name: 'Animal Crossing',
    },
    update: {},
  });
  const villagers = await fetch(
    `https://api.nookipedia.com/villagers?game=nh&nhdetails=true&api_key=${process.env.NOOKIEPEDIA_API_KEY}`,
  );
  const villagersData = await villagers.json();

  let i = 1;
  for (const villager of villagersData) {
    const name = villager.name;
    const imageUrl = villager.image_url;
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
            slug: 'animal-crossing',
          },
        },
      },
      update: {},
    });
    i++;
  }
}

async function insertLeague() {
  const fandom = await prisma.fandom.upsert({
    where: {
      slug: 'league-of-legends',
    },
    create: {
      slug: 'league-of-legends',
      name: 'League of Legends',
    },
    update: {},
  });

  const champions = await fetch(
    `http://ddragon.leagueoflegends.com/cdn/12.16.1/data/en_US/champion.json`,
  );
  const championsData = await champions.json();
  const championsList = championsData.data;
  let i = 1;
  for (const champion of championsList) {
    const name = champion.name;
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`;
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
            slug: 'league-of-legends',
          },
        },
      },
      update: {},
    });
    i++;
  }
}

async function main() {
  await insertPokemon();
  await insertAnimalCrossing();
  await insertLeague();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
