// hooks/useClientWallet.tsx
import { useEffect, useState } from 'react';

const useClientWallet = () => {
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const loadWallet = async () => {
      if (typeof window !== 'undefined') {
        // Load wallet functions only on the client-side
        const { useWallet } = await import('@aptos-labs/wallet-adapter-react');
        setWallet(useWallet());
      }
    };

    loadWallet();
  }, []);

  return wallet;
};

export default useClientWallet;
