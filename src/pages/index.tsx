import { Box, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { Fragment } from 'react';
import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = () => {
  const { data, status } = trpc.useQuery(['fandom.all']);

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

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createSSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.fetchQuery('post.all');
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
