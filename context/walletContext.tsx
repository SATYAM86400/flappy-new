import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WalletContextProps {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  account: string | null;
  sendTransaction: (transaction: any) => Promise<string>;
  walletInstalled: boolean; // flag to indicate if StarKey is installed
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [walletInstalled, setWalletInstalled] = useState(true);

  // Helper function to open the StarKey download page
  const openStarKeyWebsite = () => {
    const newWindow = window.open('https://starkey.app/', '_blank');
    if (newWindow) {
      newWindow.focus();
    }
  };

  useEffect(() => {
    const getProvider = () => {
      if (typeof window !== 'undefined' && 'starkey' in window) {
        const starKeyObject = (window as any).starkey;
        if (starKeyObject?.supra) {
          return starKeyObject.supra;
        }
      }
      return null;
    };

    const detectedProvider = getProvider();
    if (!detectedProvider) {
      console.warn('StarKey wallet not found.');
      setWalletInstalled(false);
      return; // Do not force a redirect on load.
    }
    setProvider(detectedProvider);
    setWalletInstalled(true);
    detectedProvider.on('accountChanged', (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        console.log('Switched to account', accounts[0]);
      } else {
        setAccount(null);
        setConnected(false);
        console.log('Disconnected account');
      }
    });
  }, []);

  const connect = async () => {
    if (!provider) {
      // Instead of using a native alert, we let walletInstalled be false.
      // Your UI can check walletInstalled from context and display a soft alert.
      console.warn('StarKey wallet not installed. Please install it before connecting.');
      return;
    }
    try {
      const accounts = await provider.connect();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        console.log('Connected to StarKey wallet:', accounts[0]);
      }
    } catch (err) {
      console.error('Failed to connect to StarKey:', err);
      // Handle user cancellation or errors gracefully.
    }
  };

  const disconnect = async () => {
    if (!provider) {
      console.error('StarKey provider not found');
      return;
    }
    try {
      await provider.disconnect();
      setAccount(null);
      setConnected(false);
      console.log('Disconnected from StarKey wallet');
    } catch (err) {
      console.error('Failed to disconnect from StarKey:', err);
    }
  };

  const sendTransaction = async (transaction: any) => {
    if (!provider) {
      throw new Error('StarKey provider not found');
    }
    try {
      const txHash = await provider.sendTransaction(transaction);
      console.log('Transaction sent. Hash:', txHash);
      return txHash;
    } catch (err) {
      console.error('Failed to send transaction:', err);
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{ connect, disconnect, connected, account, sendTransaction, walletInstalled }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProviderWrapper');
  }
  return context;
};
