import React, { useEffect, useState } from 'react';
import { useWalletContext } from '../context/walletContext';
import { Button, Box, Typography, Link } from '@mui/material';

const WalletSetup: React.FC = () => {
  const { connected, account, connect, disconnect, walletInstalled } =
    useWalletContext();

  /* -------- cooldown (grey‑out) logic -------- */
  const [cooldown, setCooldown] = useState(true);

  useEffect(() => {
    // 4‑second timer
    const id = setTimeout(() => setCooldown(false), 4000);
    return () => clearTimeout(id);
  }, []);

  /* -------- debug -------- */
  useEffect(() => {
    if (connected && account) {
      console.log('Wallet connected:', account);
    }
  }, [connected, account]);

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
      {/* Soft alert if the extension is missing */}
      {!walletInstalled && (
        <Box
          sx={{
            backgroundColor: '#ffebee',
            border: '1px solid #e53935',
            borderRadius: 1,
            p: 1,
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

      {/* -------- CONNECT / DISCONNECT UI -------- */}
      {!connected ? (
        <Button
  onClick={connect}
  disabled={cooldown}
  variant="contained"
  sx={{
    fontWeight: 'bold',
    minWidth: '140px',
    whiteSpace: 'nowrap',
    backgroundColor: cooldown ? '#9e9e9e' : '#1e88e5',
    '&:hover': {
      backgroundColor: cooldown ? '#9e9e9e' : '#1565c0',
    },
    cursor: cooldown ? 'not-allowed' : 'pointer',
  }}
>
  {cooldown ? 'Please wait…' : 'Connect Wallet'}
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
            onClick={disconnect}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#e53935',
              minWidth: '100px',
              '&:hover': { backgroundColor: '#b71c1c' },
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
