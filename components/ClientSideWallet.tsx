// components/ClientSideWallet.tsx
import React, { useState } from 'react';
import { useWalletContext } from '../context/walletContext';

const ClientSideWallet: React.FC = () => {
  const { connect, disconnect, connected, account } = useWalletContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await connect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (err: any) {
      console.error('Disconnection error:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {connected ? (
        <>
          <div className="text-white mb-2">Connected: {account?.address}</div>
          <button onClick={handleDisconnect} className="bg-red-500 text-white px-4 py-2 rounded">
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default ClientSideWallet;
