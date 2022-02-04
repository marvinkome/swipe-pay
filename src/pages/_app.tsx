import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import Head from "next/head";
import theme from "theme";
import * as ethers from "ethers";

export function getLibrary(provider: any): ethers.providers.Web3Provider {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Swipe ⚡️</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
    </ChakraProvider>
  );
}

export default MyApp;
