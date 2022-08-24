import Head from 'next/head';
import { ReactNode } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Flex } from '@chakra-ui/react';

import Header from './Header';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>Rank that thing!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex h="100%" direction="column">
        <Header />
        {children}
      </Flex>

      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
};
