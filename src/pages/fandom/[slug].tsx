import { useState } from 'react';
import NextError from 'next/error';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import {
  Button,
  Image,
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import Link from 'next/link';
import useStickyState from '~/hooks/useStickyState';
import useInterval from '~/hooks/useInterval';
import useHasMounted from '~/hooks/useHasMounted';
import millisecondsToTime from '~/utils/millisecondsToTime';

const ClientOnly: React.FC = ({ children }: any) => {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return null;
  }
  return <FandomPage />;
};

const FandomPage: NextPageWithLayout = () => {
  const slug = useRouter().query.slug as string;
  const [voteTimestamps, setVoteTimestamps] = useStickyState(
    [],
    `${slug}-vote-timestamps`,
  );
  const [voteResetTimestamp, setVoteResetTimestamp] = useState('');
  const { data, refetch, isFetching, error, status } = trpc.useQuery(
    ['fandom.get-pair', slug],
    {
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
  const voteMutation = trpc.useMutation(['fandom.cast-vote']);

  const castVote = (selected: string) => {
    if (voteTimestamps.length >= 10) return;
    if (!data || !data[0] || !data[1]) return;

    if (selected === data?.[0].id) {
      voteMutation.mutate({
        votedFor: data?.[0].id,
        votedAgainst: data?.[1].id,
      });
    } else {
      voteMutation.mutate({
        votedFor: data?.[1].id,
        votedAgainst: data?.[0].id,
      });
    }

    setVoteTimestamps((prevVoteTimestamps: []) => [
      ...prevVoteTimestamps,
      Date.now(),
    ]);
    refetch();
  };

  useInterval(() => {
    if (voteTimestamps.length > 0) {
      const firstVote = voteTimestamps[0];
      if (Date.now() - firstVote > 24 * 60 * 60 * 1000) {
        setVoteTimestamps((prevVoteTimestamps: []) =>
          prevVoteTimestamps.slice(1),
        );
      }
    }
    setVoteResetTimestamp(
      millisecondsToTime(
        24 * 60 * 60 * 1000 - (Date.now() - voteTimestamps[0]),
      ),
    );
  }, 1000);

  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  if (status !== 'success') {
    return <>Loading...</>;
  }

  return (
    <Flex direction="column" alignItems="center" h="100%" p={4}>
      <Flex
        justifyContent="center"
        height="100%"
        gap={2}
        alignItems="center"
        direction="column"
      >
        <Heading pb={'8'}>Which is better?</Heading>
        <Heading as="h3" size="lg">
          Votes Left:{' '}
          {voteTimestamps.length > 0 ? 10 - voteTimestamps.length : 10}
        </Heading>
        {voteTimestamps.length > 0 && (
          <Text>Next Vote: {voteResetTimestamp}</Text>
        )}
        <Flex gap={4} shadow="md" borderWidth="1px" borderRadius="lg" p={4}>
          {data?.map((item) => {
            if (!item) return null;
            if (isFetching) {
              return (
                <React.Fragment key={item.id}>
                  <Flex
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    height="100%"
                    p={2}
                  >
                    <Spinner key={item.id} color="red.500" size="xl" />
                  </Flex>
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={item.id}>
                  <Flex
                    onClick={() => castVote(item.id)}
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <Flex h="100%" alignItems="center" justifyContent="center">
                      <Image src={item.imageUrl} alt={item.name} />
                    </Flex>
                    <Box textTransform={'uppercase'}>{item.name}</Box>
                  </Flex>
                </React.Fragment>
              );
            }
          })}
        </Flex>
        <Button onClick={() => refetch()}>Skip</Button>
      </Flex>
      <Text fontSize={'xl'} fontWeight={'bold'}>
        <Link href={`/fandom/${slug}/results`}>Results</Link>
      </Text>
    </Flex>
  );
};

export default ClientOnly;
