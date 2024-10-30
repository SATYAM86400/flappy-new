// hooks/useClientWallet.tsx
import { useEffect, useState } from 'react';

const useClientWallet = () => {
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const loadWallet = () => {
      if (typeof window !== 'undefined') {
        const getProvider = () => {
          if ('starkey' in window) {
            const provider = window.starkey;

            if (provider) {
              return provider;
            }
          }

          window.open('https://starkey.app/', '_blank');
        };

        const provider = getProvider();
        if (provider) {
          setWallet(provider);
        } else {
          console.error('StarKey wallet not found');
        }
      }
    };

    loadWallet();
  }, []);

  return wallet;
};

export default useClientWallet;
