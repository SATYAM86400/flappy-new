// pages/api/supra.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { SupraClient, SupraAccount, HexString, BCS } from '../../supra-l1-sdk-wrapper';
import { Buffer } from 'buffer';

const MODULE_ADDRESS = '0x39dc021a730a577b379df7e4e8e673f8fa113b6bb2e6bce460779a0f0248d504';
const MODULE_NAME = 'flappy_game';

let supraClient: SupraClient | null = null;

async function initSupraClient() {
  if (!supraClient) {
    supraClient = await SupraClient.init('https://rpc-testnet.supra.com/');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initSupraClient();

    const { action, account, score } = req.body;

    if (!account) {
      res.status(400).json({ error: 'Account is required' });
      return;
    }

    // Attempt to initialize the module
    await initializeModuleOnChain();

    if (action === 'create_game') {
      const txHash = await adminCreateGameOnChain(account);
      res.status(200).json({ message: 'Game created on chain', txHash });
    } else if (action === 'submit_score') {
      if (typeof score !== 'number') {
        res.status(400).json({ error: 'Score must be a number' });
        return;
      }
      const txHash = await adminSubmitScoreOnChain(account, score);
      res.status(200).json({ message: 'Score submitted to blockchain', txHash });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function initializeModuleOnChain() {
  if (!supraClient) {
    throw new Error('SupraClient not initialized');
  }

  const serverPrivateKeyHex = process.env.SUPRA_PRIVATE_KEY;

  if (!serverPrivateKeyHex) {
    throw new Error('Server private key not configured');
  }

  const serverAccount = new SupraAccount(Buffer.from(serverPrivateKeyHex, 'hex'));
  const senderAddress = serverAccount.address();

  console.log('Attempting to initialize module...');
  const functionName = 'initialize_module';
  const args: any[] = [];
  const typeArguments: string[] = [];

  const accountInfo = await supraClient.getAccountInfo(senderAddress);
  const sequenceNumber = accountInfo.sequence_number;

  const serializedTx = await supraClient.createSerializedRawTxObject(
    senderAddress,
    sequenceNumber,
    MODULE_ADDRESS,
    MODULE_NAME,
    functionName,
    typeArguments,
    args
  );

  try {
    const txRes = await supraClient.sendTxUsingSerializedRawTransaction(
      serverAccount,
      serializedTx,
      {
        enableTransactionSimulation: false,
        enableWaitForTransaction: true,
      }
    );
    console.log('Module initialized:', txRes.txHash);
  } catch (error: any) {
    // If the module is already initialized, ignore the error
    if (
      error.response &&
      error.response.data &&
      error.response.data.Move &&
      error.response.data.Move.vm_status &&
      error.response.data.Move.vm_status.includes('EMODULE_ALREADY_INITIALIZED')
    ) {
      console.log('Module already initialized. Proceeding.');
    } else {
      // If the error is something else, rethrow it
      throw error;
    }
  }
}

async function adminCreateGameOnChain(playerAddress: string) {
  if (!supraClient) {
    throw new Error('SupraClient not initialized');
  }

  const functionName = 'admin_create_game';
  const args = [new HexString(playerAddress).toUint8Array()];

  const txHash = await signAndSubmitTransaction(functionName, [], args);

  console.log('Admin game creation transaction submitted:', txHash);
  return txHash;
}

async function adminSubmitScoreOnChain(playerAddress: string, score: number) {
  if (!supraClient) {
    throw new Error('SupraClient not initialized');
  }

  const functionName = 'admin_submit_score';
  const args = [
    new HexString(playerAddress).toUint8Array(),
    BCS.bcsSerializeUint64(score),
  ];

  const txHash = await signAndSubmitTransaction(functionName, [], args);

  console.log('Admin score submission transaction submitted:', txHash);
  return txHash;
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
  const accountInfo = await supraClient.getAccountInfo(senderAddress);
  const sequenceNumber = accountInfo.sequence_number;

  const serializedTx = await supraClient.createSerializedRawTxObject(
    senderAddress,
    sequenceNumber,
    MODULE_ADDRESS,
    MODULE_NAME,
    functionName,
    typeArguments,
    args
  );

  const txRes = await supraClient.sendTxUsingSerializedRawTransaction(
    serverAccount,
    serializedTx,
    {
      enableTransactionSimulation: false,
      enableWaitForTransaction: true,
    }
  );

  return txRes.txHash;
}
