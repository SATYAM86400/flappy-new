// components/ClientSideWallet.tsx
import React, { useState } from 'react';
import { useWalletContext } from '../context/walletContext';
import { Button, Box, Typography, Alert } from '@mui/material';

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
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 20,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        boxShadow: 3,
        minWidth: '150px',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem', textAlign: 'center' }}>
          {error}
        </Alert>
      )}
      {connected ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Typography color="success.main" fontWeight="bold" variant="body2" textAlign="center">
            Connected: {account?.address}
          </Typography>
          <Button
            onClick={handleDisconnect}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 'bold',
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'darkred',
              },
            }}
          >
            Disconnect Wallet
          </Button>
        </Box>
      ) : (
        <Button
          onClick={handleConnect}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 'bold',
            px: 3,
            py: 1,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: 'blue',
            },
          }}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </Box>
  );
};

export default ClientSideWallet;
