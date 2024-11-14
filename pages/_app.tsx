// pages/_app.tsx
import React from 'react';
import '../styles/globals.css';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { WalletProviderWrapper } from '../context/walletContext';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a theme (optional)
const theme = createTheme();

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <WalletProviderWrapper>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </WalletProviderWrapper>
    </AptosWalletAdapterProvider>
  );
}

export default MyApp;
