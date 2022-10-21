import { useState } from 'react';
import type { GetServerSideProps, GetStaticPaths } from 'next';
import { prisma } from '../../../server/prisma';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import bt from '../../../utils/bt';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

const getResultsInOrder = async (slug: string) => {
  const items = await prisma.fandomItem.findMany({
    where: {
      fandom: {
        slug: {
          equals: slug,
        },
      },
    },
    orderBy: {
      voteFor: { _count: 'desc' },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      voteFor: {
        select: {
          votedFor: true,
          votedAgainst: true,
        },
      },
      voteAgainst: {
        select: {
          votedFor: true,
          votedAgainst: true,
        },
      },
      _count: {
        select: {
          voteFor: true,
          voteAgainst: true,
        },
      },
    },
  });

  if (items.length === 0) {
    return items;
  }

  const votes = items.reduce((acc, item) => {
    if (item.voteFor.length > 0) {
      acc.push(...item.voteFor);
    }
    if (item.voteAgainst.length > 0) {
      acc.push(...item.voteAgainst);
    }
    return acc;
  }, [] as any);

  const ranks = bt(votes, items.length, bt(votes, items.length));

  return ranks.map((rank, index) => {
    return {
      id: items?.[index]?.id,
      name: items?.[index]?.name,
      imageUrl: items?.[index]?.imageUrl,
      rank: rank,
    };
  });
};

type ResultsQueryResult = AsyncReturnType<typeof getResultsInOrder>;

const TopListing: React.FC<{
  item: ResultsQueryResult[0] | undefined;
  rank: number;
}> = ({ item, rank }) => {
  if (!item) {
    return null;
  }
  return (
    <Flex
      key={item.id}
      direction={['column', 'row']}
      align={['flex-start', 'center', 'center', 'center']}
      justify={['center']}
      w="100%"
      h="100%"
      backgroundColor="gray.900"
      borderRadius="lg"
      gridColumnStart="1"
      gridColumnEnd="-1"
      gap={4}
      p={4}
    >
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="0 12px 12px"
        flex="0 0 54px"
        width="54px"
        height="71px"
        backgroundColor={'gray.800'}
        fontSize="36px"
        color={'green.300'}
        fontWeight="700"
        borderRadius={'lg'}
      >
        {rank}
        <Box
          position="absolute"
          left="12px"
          right="12px"
          bottom="12px"
          height="2px"
          borderRadius="1px"
          backgroundColor={'green.300'}
        />
      </Box>
      <Flex
        w="100%"
        direction={['column', 'row']}
        align={'center'}
        justify="space-evenly"
      >
        <Image
          src={item.imageUrl}
          alt={item.name}
          maxH="200px"
          maxW="200px"
          objectFit="contain"
        />
        <Text fontSize="xl" fontWeight="bold" textTransform={'uppercase'}>
          {item.name}
        </Text>
      </Flex>
    </Flex>
  );
};

const NotableListing: React.FC<{
  item: ResultsQueryResult[0] | undefined;
  rank: number;
}> = ({ item, rank }) => {
  if (!item) {
    return null;
  }
  return (
    <Flex
      key={item.id}
      direction="column"
      align="center"
      justify="center"
      h="100%"
      w="100%"
      p={4}
      backgroundColor="gray.900"
      borderRadius="lg"
    >
      <Image
        src={item.imageUrl}
        alt={item.name}
        maxH="200px"
        maxW="200px"
        objectFit="contain"
      />
      <Text fontSize="xl" fontWeight="bold" textTransform={'uppercase'}>
        {item.name}
      </Text>
      <Text fontSize="md" fontWeight="bold">
        Rank: {rank}
      </Text>
    </Flex>
  );
};

const ItemListing: React.FC<{
  item: ResultsQueryResult[number] | undefined;
  rank: number;
}> = ({ item, rank }) => {
  if (!item) {
    return null;
  }
  return (
    <Tr>
      <Td isNumeric>{rank}</Td>
      <Td>
        <Image src={item.imageUrl} alt={item.name} maxH="100px" maxW="100px" />
      </Td>
      <Td textTransform={'uppercase'}>{item.name}</Td>
    </Tr>
  );
};

const ResultsPage: React.FC<{
  data: ResultsQueryResult;
}> = ({ data }) => {
  const slug = useRouter().query.slug as string;
  const [maxListing, setMaxListing] = useState(Math.min(data?.length, 9));

  if (!data) return null;
  return (
    <div>
      <Head>
        <title>Results</title>
      </Head>

      <Flex
        justifyContent="center"
        alignItems="center"
        direction="column"
        padding={{
          base: '0 16px',
          md: '0 32px',
          lg: '0 64px',
        }}
      >
        <Heading py={8}>Results</Heading>
        <Text fontSize="xl" pb={2} fontWeight="bold" color="green.300">
          <Link href={`/fandom/${slug}`}>Vote</Link>
        </Text>
        <Grid
          gap={4}
          pt={4}
          pb={4}
          autoRows="1fr"
          gridTemplateColumns={[
            'repeat(1, 1fr)',
            'repeat(2, 1fr)',
            'repeat(4, 1fr)',
          ]}
        >
          <TopListing item={data[0]} rank={1} />
          <NotableListing item={data[1]} rank={2} />
          <NotableListing item={data[2]} rank={3} />
          <NotableListing item={data[3]} rank={4} />
          <NotableListing item={data[4]} rank={5} />
        </Grid>
        <Table>
          <Thead>
            <Tr>
              <Th isNumeric>Rank</Th>
              <Th>Image</Th>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => {
              if (index < 5) {
                return null;
              }
              if (index > maxListing) {
                return null;
              }
              return <ItemListing key={item.id} item={item} rank={index + 1} />;
            })}
          </Tbody>
        </Table>
        {maxListing < data.length && (
          <Box textAlign="center" py={4}>
            <Button
              onClick={() => {
                setMaxListing((m) => Math.min(m + 10, data.length));
              }}
            >
              Load More
            </Button>
          </Box>
        )}
      </Flex>
    </div>
  );
};

export default ResultsPage;

interface Result {
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await prisma.fandom.findMany();
  const paths = results.map((result: Result) => ({
    params: {
      slug: result.slug.toLowerCase().replace(/ /g, '-'),
    },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetServerSideProps = async ({ params }) => {
  const slug = params!.slug as string;
  const resultsOrdered = await getResultsInOrder(slug);
  const FIVE_MINUTES = 60 * 5;
  return {
    props: { data: resultsOrdered },
    revalidate: FIVE_MINUTES,
  };
};
