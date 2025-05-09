import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../supabaseClient';

/* ------------------------------------------------------------------ */
/*  Types & context                                                   */
/* ------------------------------------------------------------------ */

interface WalletContextProps {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  account: string | null;
  sendTransaction: (tx: any) => Promise<string>;
  walletInstalled: boolean;
}

export const WalletContext = createContext<WalletContextProps | null>(null);

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const detectProvider = async () => {
  const grab = () =>
    typeof window !== 'undefined' ? (window as any)?.starkey?.supra ?? null : null;

  let p = grab();
  if (p) return p;
  await delay(3000);               // give extension time to inject
  return grab();
};

/* ------------------------------------------------------------------ */
/*  Supabase I/O                                                      */
/* ------------------------------------------------------------------ */

const WALLET_TABLE = 'game_wallets';

const upsertWallet = async (addr: string) => {
  const { error } = await supabase
    .from(WALLET_TABLE)
    .upsert(
      { wallet_addr: addr, last_seen: new Date().toISOString() },
      { onConflict: 'wallet_addr' }
    );

  if (error) console.error('[Supabase] wallet upsert failed:', error);
};

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected]     = useState(false);
  const [account,   setAccount]       = useState<string | null>(null);
  const [provider,  setProvider]      = useState<any>(null);
  const [walletInstalled, setWalletInstalled] = useState(true);

  /* ---------- provider bootstrap ---------- */
  useEffect(() => {
    (async () => {
      const p = await detectProvider();
      if (!p) {
        setWalletInstalled(false);
        return;
      }
      setProvider(p);

      p.on?.('accountChanged', (accounts: string[]) => {
        if (accounts?.length) {
          const addr = accounts[0];
          setAccount(addr);
          setConnected(true);
          upsertWallet(addr);          // keep DB fresh
        } else {
          setAccount(null);
          setConnected(false);
        }
      });
    })();
  }, []);

  /* ---------- actions ---------- */

  const connect = async () => {
    if (!provider) {
      setWalletInstalled(false);
      window.open('https://starkey.app/', '_blank');
      return;
    }

    await delay(4000);                 // extension init buffer
    try {
      const accounts: string[] = await provider.connect();
      if (accounts?.length) {
        const addr = accounts[0];
        setAccount(addr);
        setConnected(true);
        console.log('Connected to StarKey:', addr);
        await upsertWallet(addr);      // first connect
      }
    } catch (err) {
      console.error('Connect failed / rejected:', err);
    }
  };

  const disconnect = async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
    } finally {
      setAccount(null);
      setConnected(false);
    }
  };

  const sendTransaction = async (tx: any) => {
    if (!provider) throw new Error('StarKey provider not found');
    return provider.sendTransaction(tx);
  };

  /* ---------- expose ---------- */
  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        connected,
        account,
        sendTransaction,
        walletInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx)
    throw new Error('useWalletContext must be used inside WalletProviderWrapper');
  return ctx;
};
