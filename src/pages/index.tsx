import {
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';

import fireEmblemImage from '../assets/Fire_Emblem_Three_Houses_Logo.webp';
import pokemonImage from '../assets/pokemon-logo-png-1446.png';
import stardewValleyImage from '../assets/stardew-valley.png';
import animalCrossingImage from '../assets/animal-crossing.png';
import leagueOfLegendsImage from '../assets/league-of-legends.png';

const slugToImage = {
  'fire-emblem-3-houses': fireEmblemImage,
  pokemon: pokemonImage,
  'stardew-valley': stardewValleyImage,
  'animal-crossing': animalCrossingImage,
  'league-of-legends': leagueOfLegendsImage,
} as SlugToImage;

interface SlugToImage {
  [key: string]: {
    src: string;
  };
}

const IndexPage: NextPageWithLayout = (props) => {
  const { data, isFetching } = trpc.useQuery(['fandom.all']);

  return (
    <Box p={4}>
      <Heading size="lg">Pick a Fandom</Heading>
      <Flex p={4} gap={4} wrap="wrap">
        {isFetching && <Spinner color="red.500" size="xl" />}
        {data &&
          !isFetching &&
          data.map((fandom) => {
            return (
              <Box
                key={fandom.id}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Link href={`/fandom/${fandom.slug}`}>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="whiteAlpha.900"
                  >
                    <Image
                      src={slugToImage[fandom.slug]?.src || ''}
                      w={'auto'}
                      h={'100%'}
                      maxH={'140px'}
                    />
                  </Box>
                </Link>
              </Box>
            );
          })}
      </Flex>
      {!isFetching && (
        <Center>
          <Text>
            This site is in no way affiliated with any of the companies whose
            Intellectual Propertiess are being ranked.
          </Text>
        </Center>
      )}
    </Box>
  );
};
export default IndexPage;
