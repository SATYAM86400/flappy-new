import React, { useEffect } from 'react';
import { useWalletContext } from '../context/walletContext';
import { Button, Box, Typography, Link } from '@mui/material';

const WalletSetup: React.FC = () => {
  const { connected, account, connect, disconnect, walletInstalled } = useWalletContext();

  useEffect(() => {
    if (connected && account) {
      console.log('Wallet is connected with address:', account);
    }
  }, [connected, account]);

  const handleConnect = async () => {
    // If wallet is not installed, open the download page instead
    if (!walletInstalled) {
      window.open('https://starkey.app/', '_blank');
      return;
    }
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
      {/* Soft in-page alert if wallet is not installed */}
      {!walletInstalled && (
        <Box
          sx={{
            backgroundColor: '#ffebee',
            border: '1px solid #e53935',
            borderRadius: 1,
            padding: 1,
            mb: 1,
          }}
        >
          <Typography variant="body2" color="error">
            StarKey wallet is not installed.{' '}
            <Link
              href="https://starkey.app/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 'bold' }}
            >
              Download here.
            </Link>
          </Typography>
        </Box>
      )}

      {!connected ? (
        <Button
          onClick={handleConnect}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#1e88e5',
            minWidth: '140px',
            whiteSpace: 'nowrap',
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
              minWidth: '100px',
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
