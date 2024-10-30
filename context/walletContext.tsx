import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WalletContextProps {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  account: string | null;
  sendTransaction: (transaction: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    const getProvider = () => {
      if ('starkey' in window) {
        const provider = window.starkey?.supra;

        if (provider) {
          return provider;
        }
      }

      window.open('https://starkey.app/', '_blank');
    };

    const provider = getProvider();
    if (provider) {
      setProvider(provider);

      // Handle account changes
      provider.on('accountChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setConnected(false);
        }
      });
    } else {
      console.error('StarKey wallet not found');
    }
  }, []);

  const connect = async () => {
    if (!provider) {
      console.error('StarKey provider not found');
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
      console.error('StarKey provider not found');
      throw new Error('Provider not found');
    }
    try {
      const txHash = await provider.sendTransaction(transaction);
      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (err) {
      console.error('Failed to send transaction:', err);
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{ connect, disconnect, connected, account, sendTransaction }}
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
