import React, { useEffect } from 'react';
import { useWalletContext } from '../context/walletContext';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';

const WalletSetup: React.FC = () => {
  const { connected, account } = useWalletContext();

  useEffect(() => {
    if (connected && account) {
      console.log('Wallet is connected with address:', account.address);
    }
  }, [connected, account]);

  return (
    <div className="absolute top-4 right-4 z-20">
      {/* Render only the WalletSelector component */}
      <WalletSelector />
    </div>
  );
};

export default WalletSetup;
