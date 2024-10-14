import '../styles/globals.css';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { WalletProviderWrapper } from '../context/walletContext'; // Import your WalletProviderWrapper
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = [new PetraWallet()]; // Add other wallets if needed

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <WalletProviderWrapper>
        <Component {...pageProps} />
      </WalletProviderWrapper>
    </AptosWalletAdapterProvider>
  );
}

export default MyApp;
