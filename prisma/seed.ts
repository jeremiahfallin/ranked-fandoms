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
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

interface LeagueData {
  id: string;
  name: string;
}

interface RoommateData {
  name: string;
  imageUrl: string;
}

interface FireEmblemThreeHousesData {
  name: string;
  imageUrl: string;
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
    const imageUrl =
      pokemonData.sprites.other.dream_world.front_default ||
      pokemonData.sprites.other['official-artwork'].front_default;

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

async function insertStardew() {
  const slug = 'stardew-valley';
  const fandom = await prisma.fandom.upsert({
    where: {
      slug,
    },
    create: {
      slug,
      name: 'Stardew Valley',
    },
    update: {},
  });

  const roommates = [
    {
      name: 'Abigail',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487035/rank/Abigail.png',
    },
    {
      name: 'Alex',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487017/rank/Alex.png',
    },
    {
      name: 'Elliott',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487020/rank/Elliott.png',
    },
    {
      name: 'Emily',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487043/rank/Emily.png',
    },
    {
      name: 'Haley',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487047/rank/Haley.png',
    },
    {
      name: 'Harvey',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487023/rank/Harvey.png',
    },
    {
      name: 'Krobus',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487058/rank/Krobus.png',
    },
    {
      name: 'Leah',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487050/rank/Leah.png',
    },
    {
      name: 'Maru',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487053/rank/Maru.png',
    },
    {
      name: 'Penny',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487055/rank/Penny.png',
    },
    {
      name: 'Sam',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487026/rank/Sam.png',
    },
    {
      name: 'Sebastian',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487030/rank/Sebastian.png',
    },
    {
      name: 'Shane',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661487033/rank/Shane.png',
    },
  ] as RoommateData[];
  let i = 1;
  for (const roommate of roommates) {
    await prisma.fandomItem.upsert({
      where: {
        id: `${slug}-${i}`,
      },
      create: {
        id: `${slug}-${i}`,
        name: roommate.name,
        imageUrl: roommate.imageUrl,
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

async function insertFireEmblemThreeHouses() {
  const slug = 'fire-emblem-3-houses';
  const fandom = await prisma.fandom.upsert({
    where: {
      slug,
    },
    create: {
      slug,
      name: 'Fire Emblem 3 Houses',
    },
    update: {},
  });

  const characters = [
    {
      name: 'Hapi',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489544/rank/Hapi_Portrait.webp',
    },
    {
      name: 'Constance',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489543/rank/Constance_Portrait.webp',
    },
    {
      name: 'Balthus',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489541/rank/Balthus_Portrait.webp',
    },
    {
      name: 'Yuri',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489540/rank/Yuri_Portrait.webp',
    },
    {
      name: 'Aelfric',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489537/rank/3H_Aelfric_Portrait.webp',
    },
    {
      name: 'Anna',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489535/rank/Anna_3_Houses_portrait.webp',
    },
    {
      name: 'Jeritza',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489533/rank/Jeritza_no_mask.webp',
    },
    {
      name: 'Cyril',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489532/rank/Cyril_Portrait.webp',
    },
    {
      name: 'Shamir',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489530/rank/Shamir_Portrait.webp',
    },
    {
      name: 'Catherine',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489527/rank/Catherine_Portrait.webp',
    },
    {
      name: 'Alois',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489524/rank/Alois_Portrait.webp',
    },
    {
      name: 'Gilbert',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489522/rank/Gilbert_Portrait.webp',
    },
    {
      name: 'Manuela',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489521/rank/Manuela_Portrait.webp',
    },
    {
      name: 'Hanneman',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489519/rank/Hanneman_Portrait.webp',
    },
    {
      name: 'Flayn',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489516/rank/Flayn_Portrait.webp',
    },
    {
      name: 'Seteth',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489514/rank/Seteth_Portrait.webp',
    },
    {
      name: 'Leonie',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489511/rank/Leonie_Portrait.webp',
    },
    {
      name: 'Hilda',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489506/rank/Hilda_Portrait.webp',
    },
    {
      name: 'Marianne',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489502/rank/Marianne_Portrait.webp',
    },
    {
      name: 'Lysithea',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489499/rank/Lysithea_Portrait.webp',
    },
    {
      name: 'Ignace',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489497/rank/Ignace_Portrait.webp',
    },
    {
      name: 'Raphael',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489494/rank/Raphael_Portrait.webp',
    },
    {
      name: 'Lorentz',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489492/rank/Lorentz_Portrait.webp',
    },
    {
      name: 'Claude',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489489/rank/Claude_FE16.webp',
    },
    {
      name: 'Ingrid',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489486/rank/Ingrid_Portrait.webp',
    },
    {
      name: 'Annette',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489483/rank/Annette_Portrait.webp',
    },
    {
      name: 'Mercedes',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489479/rank/Mercedes_Portrait.webp',
    },
    {
      name: 'Sylvain',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489476/rank/Sylvain_Portrait.webp',
    },
    {
      name: 'Ashe',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489472/rank/Ashe_Portrait.webp',
    },
    {
      name: 'Felix',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489469/rank/Felix_Portrait.webp',
    },
    {
      name: 'Doudou',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489467/rank/Doudou_Portrait.webp',
    },
    {
      name: 'Dimitri',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489463/rank/Dimitri.webp',
    },
    {
      name: 'Petra',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489460/rank/Petra_Portrait.webp',
    },
    {
      name: 'Dorothea',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489457/rank/Dorothea_Portrait.webp',
    },
    {
      name: 'Bernadetta',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489454/rank/Bernadetta_Portrait.webp',
    },
    {
      name: 'Caspar',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489449/rank/Caspar_Portrait.webp',
    },
    {
      name: 'Linhardt',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489446/rank/Linhardt_Portrait.webp',
    },
    {
      name: 'Ferdinand',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489443/rank/Ferdinand_Portrait.webp',
    },
    {
      name: 'Hubert',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489440/rank/Hubert_Portrait.webp',
    },
    {
      name: 'Edelgard',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489437/rank/Edelgard.webp',
    },
    {
      name: 'Byleth (Female)',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489432/rank/Byleth-F.webp',
    },
    {
      name: 'Byleth (Male)',
      imageUrl:
        'https://res.cloudinary.com/tacit/image/upload/v1661489428/rank/Byleth-M.webp',
    },
  ] as FireEmblemThreeHousesData[];

  let i = 1;
  for (const character of characters) {
    await prisma.fandomItem.upsert({
      where: {
        id: `${slug}-${i}`,
      },
      create: {
        id: `${slug}-${i}`,
        name: character.name,
        imageUrl: character.imageUrl,
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

async function main() {
  // await insertPokemon();
  await insertStardew();
  await insertFireEmblemThreeHouses();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
