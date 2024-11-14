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

  const handleDisconnect = async () => {
    try {
      await disconnect();
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {!connected ? (
        <Button
          onClick={handleConnect}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#1e88e5',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Connect Wallet
        </Button>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color="textPrimary"
            sx={{
              maxWidth: '150px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'right',
            }}
          >
            Connected: {account}
          </Typography>
          <Button
            onClick={handleDisconnect}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#e53935',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            Disconnect
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ClientSideWallet;
