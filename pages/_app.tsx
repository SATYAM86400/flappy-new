// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React from 'react';
import { WalletProviderWrapper } from '../context/walletContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProviderWrapper>
      <Component {...pageProps} />
    </WalletProviderWrapper>
  );
}

export default MyApp;
