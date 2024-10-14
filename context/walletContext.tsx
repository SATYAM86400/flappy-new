import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';

interface WalletContextProps {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  account: { address: string } | null;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wallet = useWallet();

  return (
    <WalletContext.Provider value={wallet}>
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
