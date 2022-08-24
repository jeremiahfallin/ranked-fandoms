import NextError from 'next/error';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { Image, Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import React from 'react';

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
    if (!data) return; // Early escape to make Typescript happy

    if (selected === data?.[0].id) {
      // If voted for 1st pokemon, fire voteFor with first ID
      voteMutation.mutate({
        votedFor: data?.[0].id,
        votedAgainst: data?.[1].id,
      });
    } else {
      // else fire voteFor with second ID
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

      <Flex justifyContent="center" height="100%" gap={2} alignItems="center">
        <Flex
          h="240px"
          gap={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          p={8}
        >
          {data.map((item) => {
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
                    <Flex h="100%" pb={4}>
                      <Image src={item.imageUrl} alt={item.name} maxH="200px" />
                    </Flex>
                    <Box textTransform={'uppercase'}>{item.name}</Box>
                  </Flex>
                </React.Fragment>
              );
            }
          })}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default FandomPage;
