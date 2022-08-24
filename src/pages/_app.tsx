import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { loggerLink } from '@trpc/client/links/loggerLink';
import { withTRPC } from '@trpc/next';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import superjson from 'superjson';
import { DefaultLayout } from '~/components/DefaultLayout';
import { AppRouter } from '~/server/routers/_app';
import { SSRContext } from '~/utils/trpc';

export const theme = extendTheme({
  styles: {
    global: {
      'body, html': {
        height: '100%',
        minHeight: '100%',
        minWidth: '100%',
        overflowX: 'hidden',
      },
      '#__next': {
        height: '100%',
        minHeight: '100%',
        minWidth: '100%',
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </ChakraProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export default withTRPC<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],

      transformer: superjson,
    };
  },

  ssr: true,

  responseMeta(opts) {
    const ctx = opts.ctx as SSRContext;

    if (ctx.status) {
      return {
        status: ctx.status,
      };
    }

    const error = opts.clientErrors[0];
    if (error) {
      return {
        status: error.data?.httpStatus ?? 500,
      };
    }
    return {};
  },
})(MyApp);
