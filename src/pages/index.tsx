import {
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Spinner,
  Text,
  keyframes,
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

const rotate = keyframes`
  from {
    transform: rotateY(-360deg);
  }
  to {
    transform: rotateY(0deg);
  }
`;

interface Fandom {
  name: string;
  slug: string;
}

const Wrapper = ({ fandoms }: { fandoms: Fandom[] }) => {
  return (
    <Box
      position="relative"
      width="320px"
      margin="150px auto"
      style={{ perspective: '1000px' }}
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        transform={`rotateY(-360deg) translateZ(-300px)`}
        animation={`${rotate} 40s steps(10000, end) infinite`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {fandoms.map((t, i) => (
          <Box
            key={i}
            position="absolute"
            top="10px"
            left="10px"
            background="green.400"
            p="2"
            borderRadius="md"
            transform={`rotateY(${
              (360 / fandoms.length) * i
            }deg) translateZ(300px)`}
          >
            <Link href={`/fandom/${t.slug}/`}>{t.name}</Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface ImageFandom {
  name: string;
  slug: string;
  imageUrl: string;
}

const ImageWrapper = ({ fandoms }: { fandoms: ImageFandom[] }) => {
  return (
    <Box
      position="relative"
      width="320px"
      margin="150px auto"
      style={{ perspective: '1000px' }}
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        transform={`rotateY(-360deg) translateZ(-300px)`}
        animation={`${rotate} 40s steps(10000, end) infinite`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {fandoms.map((t, i) => (
          <Box
            key={i}
            position="absolute"
            top="10px"
            left="10px"
            background="green.400"
            p="2"
            borderRadius="md"
            transform={`rotateY(${
              (360 / fandoms.length) * i
            }deg) translateZ(300px)`}
          >
            <Image height="120px" src={t.imageUrl} alt={t.name} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const IndexPage: NextPageWithLayout = (props) => {
  const { data, isFetching } = trpc.useQuery(['fandom.all']);

  return (
    <Box p={4}>
      <Center>
        <Heading size="lg">Pick a Fandom</Heading>
      </Center>
      <Flex p={4} gap={4} wrap="wrap">
        {isFetching && <Spinner color="red.500" size="xl" />}
        {data && !isFetching && (
          <ImageWrapper
            fandoms={data.map((fandom) => {
              return {
                name: fandom.name,
                slug: fandom.slug,
                imageUrl: slugToImage[fandom.slug]?.src ?? '',
              };
            })}
          />
        )}
      </Flex>
      {!isFetching && (
        <Center pt="48">
          <Text>
            This site is in no way affiliated with any of the companies whose
            Intellectual Properties are being ranked.
          </Text>
        </Center>
      )}
    </Box>
  );
};
export default IndexPage;
