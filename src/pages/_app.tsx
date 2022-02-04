import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import Head from "next/head";
import theme from "theme";
import * as ethers from "ethers";
import { QueryClient, QueryClientProvider } from "react-query";

export function getLibrary(provider: any): ethers.providers.Web3Provider {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 240 * 1000,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Swipe ⚡️</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Component {...pageProps} />
        </Web3ReactProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
