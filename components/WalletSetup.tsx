// components/WalletSetup.tsx
import React, { useEffect } from 'react';
import { useWalletContext } from '../context/walletContext';
import { Button, Box, Typography } from '@mui/material';

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
            minWidth: '140px', // Set a minimum width to prevent text wrapping
            whiteSpace: 'nowrap', // Prevents wrapping
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
              minWidth: '100px', // Adjust width for consistency with other buttons
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

export default WalletSetup;
