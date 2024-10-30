import React, { useEffect } from 'react';
import { useWalletContext } from '../context/walletContext';

const WalletSetup: React.FC = () => {
  const { connected, account, connect, disconnect } = useWalletContext();

  useEffect(() => {
    if (connected && account) {
      console.log('Wallet is connected with address:', account);
    }
  }, [connected, account]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      {!connected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
};

export default WalletSetup;
