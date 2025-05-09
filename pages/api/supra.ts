// pages/api/supra.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { SupraClient, SupraAccount, HexString, BCS } from '../../supra-l1-sdk-wrapper';
import { Buffer } from 'buffer';

const MODULE_ADDRESS = '0x39dc021a730a577b379df7e4e8e673f8fa113b6bb2e6bce460779a0f0248d504';
const MODULE_NAME = 'flappy_game_four';

let supraClient: SupraClient | null = null;
let moduleWasInitialized = false;

async function initSupraClient() {
  if (!supraClient) {
    supraClient = await SupraClient.init('https://rpc-mainnet.supra.com/');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initSupraClient();
    const { action, account, score } = req.body;
    if (!account) {
      return res.status(400).json({ error: 'Account is required' });
    }

    // if (!moduleWasInitialized) {
    //   await initializeModuleOnChain();
    //   moduleWasInitialized = true;
    // }

    if (action === 'create_game') {
      const txHash = await createGameOnChain();
      return res.status(200).json({ message: 'Game created on chain', txHash });
    } else if (action === 'submit_score') {
      if (typeof score !== 'number') {
        return res.status(400).json({ error: 'Score must be a number' });
      }
      const txHash = await submitScoreOnChain(score);
      return res.status(200).json({ message: 'Score submitted to blockchain', txHash });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function initializeModuleOnChain() {
  if (!supraClient) {
    throw new Error('SupraClient not initialized');
  }
  const serverPrivateKeyHex = process.env.SUPRA_PRIVATE_KEY;
  if (!serverPrivateKeyHex) {
    throw new Error('Server private key not configured in .env');
  }
  console.log('Attempting to initialize module...');
  try {
    const txHash = await signAndSubmitTransaction('initialize_module', [], []);
    console.log('Module initialized:', txHash);
  } catch (error: any) {
    const vmStatus = error?.response?.data?.Move?.vm_status ?? error?.response?.data?.message ?? '';
    if (vmStatus.includes('EMODULE_ALREADY_INITIALIZED')) {
      console.log('Module is already initialized. Proceeding...');
      return;
    }
    throw error;
  }
}

async function createGameOnChain() {
  // The Move function create_game(&signer) takes no extra arguments
  const functionName = "create_game";
  const args: any[] = [];
  return signAndSubmitTransaction(functionName, [], args);
}

async function submitScoreOnChain(score: number) {
  // The Move function submit_score(&signer, new_score: u64)
  const functionName = "submit_score";
  // Convert score to BigInt for proper u64 serialization
  const args = [BCS.bcsSerializeUint64(BigInt(score))];
  return signAndSubmitTransaction(functionName, [], args);
}

async function signAndSubmitTransaction(
  functionName: string,
  typeArguments: string[],
  args: any[]
) {
  if (!supraClient) {
    throw new Error('SupraClient not initialized');
  }
  const serverPrivateKeyHex = process.env.SUPRA_PRIVATE_KEY;
  if (!serverPrivateKeyHex) {
    throw new Error('Server private key not configured');
  }
  const serverAccount = new SupraAccount(Buffer.from(serverPrivateKeyHex, 'hex'));
  const senderAddress = serverAccount.address();
  let tries = 0;
  while (true) {
    try {
      const { sequence_number } = await supraClient.getAccountInfo(senderAddress);
      const serializedTx = await supraClient.createSerializedRawTxObject(
        senderAddress,
        sequence_number,
        MODULE_ADDRESS,
        MODULE_NAME,
        functionName,
        typeArguments,
        args
      );
      const txRes = await supraClient.sendTxUsingSerializedRawTransaction(serverAccount, serializedTx, {
        enableTransactionSimulation: false,
        enableWaitForTransaction: true,
      });
      console.log(`${functionName} transaction submitted:`, txRes.txHash);
      return txRes.txHash;
    } catch (error: any) {
      // Log full error details to help diagnose the failure
      console.error(`Error in ${functionName} transaction:`, error.response?.data || error);
      const msg = error?.response?.data?.message || '';
      if (msg.includes('SEQUENCE_NUMBER_TOO_OLD') && tries < 5) {
        tries++;
        console.warn(`SEQUENCE_NUMBER_TOO_OLD. Retry #${tries} ...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }
}
