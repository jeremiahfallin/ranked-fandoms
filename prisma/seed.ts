import fetch from 'cross-fetch';
import { PrismaClient } from '@prisma/client';
import { string } from 'zod';

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

interface LeagueData {
  id: string;
  name: string;
}

async function insertPokemon() {
  const slug = 'pokemon';
  const fandom = await prisma.fandom.upsert({
    where: {
      slug,
    },
    create: {
      slug,
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
          id: `${slug}-${i}`,
        },
        create: {
          id: `${slug}-${i}`,
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
      console.log(pokemonData);
      break;
    }
    i++;
  }
}

async function insertAnimalCrossing() {
  const slug = 'animal-crossing';
  const fandom = await prisma.fandom.upsert({
    where: {
      slug,
    },
    create: {
      slug,
      name: 'Animal Crossing',
    },
    update: {},
  });
  const villagers = await fetch(
    `https://api.nookipedia.com/villagers?game=nh&nhdetails=true&api_key=${process.env.NOOKIPEDIA_API_KEY}`,
  );
  const villagersData = await villagers.json();
  console.dir(villagersData);

  let i = 1;
  for (const villager of villagersData) {
    const name = villager.name;
    const imageUrl = villager.image_url;
    await prisma.fandomItem.upsert({
      where: {
        id: `${slug}-${i}`,
      },
      create: {
        id: `${slug}-${i}`,
        name,
        imageUrl,
        rating: 0,
        fandom: {
          connect: {
            slug,
          },
        },
      },
      update: {},
    });
    i++;
  }
}

async function insertLeague() {
  const slug = 'league-of-legends';
  const fandom = await prisma.fandom.upsert({
    where: {
      slug,
    },
    create: {
      slug,
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
  for (let champion of Object.keys(championsList)) {
    const name = championsList[champion].name;
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championsList[champion].id}_0.jpg`;

    await prisma.fandomItem.upsert({
      where: {
        id: `${slug}-${i}`,
      },
      create: {
        id: `${slug}-${i}`,
        name,
        imageUrl,
        rating: 0,
        fandom: {
          connect: {
            slug,
          },
        },
      },
      update: {},
    });
    i++;
  }
}

async function fixVotes() {
  const slug = 'pokemon';
  const items = await prisma.vote.findMany();
  for (const item of items) {
    if (
      !item.votedForId.includes(`${slug}-`) &&
      !item.votedAgainstId.includes(`${slug}-`)
    ) {
      await prisma.vote.update({
        where: {
          id: item.id,
        },
        data: {
          votedFor: {
            connect: {
              id: `${slug}-${item.votedForId}`,
            },
          },
          votedAgainst: {
            connect: {
              id: `${slug}-${item.votedAgainstId}`,
            },
          },
        },
      });
    }
  }
}

async function main() {
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
