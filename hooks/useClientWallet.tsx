import { useContext } from 'react';
import { WalletContext } from '../context/walletContext';

/** Access the raw provider directly if ever needed by lower‑level hooks */
const useClientWallet = () => {
  const ctx = useContext(WalletContext);
  return (ctx as any)?.provider ?? null;
};

export default useClientWallet;
