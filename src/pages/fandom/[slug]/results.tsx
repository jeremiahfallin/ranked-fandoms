import type { GetServerSideProps, GetStaticPaths } from 'next';
import { prisma } from '../../../server/prisma';

import { Box, Flex, Grid, Heading, Image } from '@chakra-ui/react';
import Head from 'next/head';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

function generateArray(w: number, h: number, val: number) {
  var arr = [];
  for (let i = 0; i < h; i++) {
    arr[i] = [];
    for (let j = 0; j < w; j++) {
      arr[i][j] = val;
    }
  }
  return arr;
}

// generate and return results using bradley-terry algorithm

const calculateRanks = (
  votes: any,
  length: number,
  initialRanks: number[] = [],
) => {
  const initialArray = generateArray(length, length, 0);

  const matrix = votes.reduce((acc, curr) => {
    acc[parseInt(curr.votedFor.id)][parseInt(curr.votedAgainst.id)] =
      acc[parseInt(curr.votedFor.id)][parseInt(curr.votedAgainst.id)] + 1;
    return acc;
  }, initialArray);

  let ranks = Array.from(Array(length), (_) => 1);

  for (let i = 0; i < length; i++) {
    const numerator = matrix[i].reduce((acc, curr) => {
      return acc + curr;
    }, 0);
    let denominator = 0;
    for (let j = 0; j < length; j++) {
      denominator += (matrix[i][j] + matrix[j][i]) / (ranks[i] + ranks[j]);
    }
    ranks[i] = numerator / denominator || 0;
  }

  const sum = ranks.reduce((acc, curr) => {
    return acc + curr;
  }, 0);

  ranks = ranks
    .map((rank) => {
      return rank / sum;
    })
    .sort((a, b) => {
      return b - a;
    });

  return ranks;
};

const getResultsInOrder = async () => {
  const items = await prisma.fandomItem.findMany({
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

  const votes = items.reduce((acc, item) => {
    if (item.voteFor.length > 0) {
      acc.push(...item.voteFor);
    }
    if (item.voteAgainst.length > 0) {
      acc.push(...item.voteAgainst);
    }
    return acc;
  }, []);

  return calculateRanks(
    votes,
    items.length,
    calculateRanks(votes, items.length),
  ).map((rank, index) => {
    return {
      id: items[index].id,
      name: items[index].name,
      imageUrl: items[index].imageUrl,
      rank: rank,
    };
  });
};

type ResultsQueryResult = AsyncReturnType<typeof getResultsInOrder>;

const generateCountPercent = (pokemon: ResultsQueryResult[number]) => {
  const { voteFor, voteAgainst } = pokemon._count;
  if (!voteFor || !voteAgainst) return 0;
  if (voteFor + voteAgainst === 0) {
    return 0;
  }
  return (voteFor / (voteFor + voteAgainst)) * 100;
};

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
        <Image src={item.imageUrl} maxH="100px" maxW="100px" />
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
  if (!data) return null;
  return (
    <div>
      <Head>
        <title>Results</title>
      </Head>
      <Flex justifyContent="center" alignItems="center" direction="column">
        <Heading pb={8}>Results</Heading>
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

export const getStaticProps: GetServerSideProps = async () => {
  const resultsOrdered = await getResultsInOrder();
  const DAY_IN_SECONDS = 60 * 60 * 24;
  return { props: { data: resultsOrdered }, revalidate: DAY_IN_SECONDS };
};
