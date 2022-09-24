import type { GetServerSideProps, GetStaticPaths } from 'next';
import { prisma } from '../../../server/prisma';

import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
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

const ItemListing: React.FC<{
  item: ResultsQueryResult[number];
  rank: number;
}> = ({ item, rank }) => {
  return (
    <Flex
      direction="row"
      alignItems="center"
      border="1px"
      width="380px"
      height="120px"
      p={4}
      position="relative"
      justifyContent={'space-between'}
    >
      <Box position="absolute" top={0} right={0} p={2}>
        {rank}
      </Box>
      <Box>
        <Image src={item.imageUrl} alt={item.name} maxH="100px" maxW="100px" />
      </Box>
      <Flex direction="column" alignItems="center">
        <Box textTransform={'uppercase'}>{item.name}</Box>
      </Flex>
    </Flex>
  );
};

const ResultsPage: React.FC<{
  data: ResultsQueryResult;
}> = ({ data }) => {
  const slug = useRouter().query.slug as string;
  if (!data) return null;
  return (
    <div>
      <Head>
        <title>Results</title>
      </Head>

      <Flex justifyContent="center" alignItems="center" direction="column">
        <Heading pb={8}>Results</Heading>
        <Text fontSize="xl" pb={2}>
          <Link href={`/fandom/${slug}`}>Vote</Link>
        </Text>
        {data.map((item, index) => {
          return <ItemListing key={item.id} item={item} rank={index + 1} />;
        })}
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
  return { props: { data: resultsOrdered }, revalidate: FIVE_MINUTES };
};
