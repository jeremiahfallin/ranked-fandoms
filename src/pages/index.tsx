import { Box, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { Fragment } from 'react';
import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = (props) => {
  const { data } = trpc.useQuery(['fandom.all']);

  return (
    <>
      <hr />
      <Box p={4}>
        <Heading>Pick a Fandom</Heading>
        <Flex p={4} gap={4}>
          {data &&
            data.map((fandom) => {
              return (
                <Fragment key={fandom.id}>
                  <Link href={`/fandom/${fandom.slug}`}>{fandom.name}</Link>
                </Fragment>
              );
            })}
        </Flex>
      </Box>
    </>
  );
};

export default IndexPage;

// get static props
export async function getStaticProps() {
  return {
    props: {
      data: 0,
    },
  };
}
