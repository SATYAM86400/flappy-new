import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface WalletContextProps {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  account: string | null;
  sendTransaction: (tx: any) => Promise<string>;
  walletInstalled: boolean;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [walletInstalled, setWalletInstalled] = useState(true);

  /** ------------ helpers ------------ */

  // resolves after ms
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  /** Attempts to grab window.starkey.supra (waits once before giving up) */
  const detectProvider = async () => {
    const getProviderOnce = () => {
      if (typeof window === 'undefined') return null;
      return (window as any)?.starkey?.supra ?? null;
    };

    let p = getProviderOnce();
    if (p) return p; // fast‑path

    // Wallets inject after window load – give them a moment
    await delay(3000);
    p = getProviderOnce();
    return p;
  };

  /** ------------ lifecycle ------------ */

  useEffect(() => {
    (async () => {
      const p = await detectProvider();
      if (!p) {
        setWalletInstalled(false);
        return;
      }
      setProvider(p);
      setWalletInstalled(true);

      // listen for account changes
      p.on?.('accountChanged', (accounts: string[]) => {
        if (accounts?.length) {
          setAccount(accounts[0]);
          setConnected(true);
        } else {
          setAccount(null);
          setConnected(false);
        }
      });
    })();
  }, []);

  /** ------------ public API ------------ */

  const connect = async () => {
    if (!provider) {
      setWalletInstalled(false);
      window.open('https://starkey.app/', '_blank');
      return;
    }

    // give the extension time to finish initialisation
    await delay(4000);

    try {
      const accounts: string[] = await provider.connect();
      if (accounts?.length) {
        setAccount(accounts[0]);
        setConnected(true);
        console.log('Connected to StarKey:', accounts[0]);
      }
    } catch (err) {
      console.error('User rejected or connection failed:', err);
    }
  };

  const disconnect = async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
      setAccount(null);
      setConnected(false);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const sendTransaction = async (tx: any) => {
    if (!provider) throw new Error('StarKey provider not found');
    return provider.sendTransaction(tx);
  };

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

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx)
    throw new Error('useWalletContext must be used inside WalletProviderWrapper');
  return ctx;
};
