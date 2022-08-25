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

const FandomPage: NextPageWithLayout = () => {
  const slug = useRouter().query.slug as string;
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

    refetch();
  };

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
      <Heading>Choose which is best!</Heading>
      <Flex
        justifyContent="center"
        height="100%"
        gap={2}
        alignItems="center"
        direction="column"
      >
        <Flex
          h="240px"
          gap={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          p={8}
        >
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
                    p={2}
                  >
                    <Flex
                      h="100%"
                      pb={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Image src={item.imageUrl} alt={item.name} maxH="200px" />
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
      <Text>
        <Link href={`/fandom/${slug}/results`}>Results</Link>
      </Text>
    </Flex>
  );
};

export default FandomPage;
