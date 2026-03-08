import { JSONRpcProvider, getContract, ABIDataTypes, BitcoinAbiTypes } from 'opnet';
import { networks } from '@btc-vision/bitcoin';

const RPC_URL = 'https://testnet.opnet.org';
const EXPLORER_BASE = 'https://opscan.org/transactions';
const ACCOUNT_EXPLORER_BASE = 'https://opscan.org/accounts';
const NETWORK_PARAM = 'op_testnet';

// Deployed contract addresses
export const CRYPTEXBTC_CONTRACTS = {
  vaultFactory: 'opt1sqq06zpphcge0xepm6jua7zlghf6r5g0k4cl0vg4e',
  accessAudit: 'opt1sqq5d6k7sywghajwth0j74xgr64rkaf9cgqg7sx7a',
  dataVaultTemplate: 'opt1sqqcn9x4yzmck288uehtj0t7xj4wxv6hfycfyduly',
  timeVaultTemplate: 'opt1sqq9dac3l3288c26twj037d0q7hqzkkkuwsvrw6jh',
  beneficiaryVaultTemplate: 'opt1sqr3dgjt2nkprmv4fsjxd5v89795uzmnjmgc8f0t2',
  deadManVaultTemplate: 'opt1sqzrkuxgt604nmhs09cl9wyfhs2gu6ag4kcuqwhsr',
};

// DataVault ABI - minimal contract version
export const DATAVAULT_ABI = [
  { type: 'function', name: 'createVault', inputs: [
    { name: 'dataHash', type: 'uint256' },
    { name: 'passwordHash', type: 'uint256' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'unlockWithPassword', inputs: [
    { name: 'passwordHash', type: 'uint256' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'changePassword', inputs: [
    { name: 'oldPasswordHash', type: 'uint256' },
    { name: 'newPasswordHash', type: 'uint256' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'getDataHash', inputs: [], outputs: [{ name: 'dataHash', type: 'uint256' }] },
  { type: 'function', name: 'getPasswordHash', inputs: [], outputs: [{ name: 'passwordHash', type: 'uint256' }] },
  { type: 'function', name: 'getIsActive', inputs: [], outputs: [{ name: 'isActive', type: 'bool' }] },
  { type: 'function', name: 'getVaultCount', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
];

export const TIMEVAULT_ABI = [
  { type: 'function', name: 'createVault', inputs: [
    { name: 'dataHash', type: 'uint256' },
    { name: 'unlockBlock', type: 'uint256' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'unlockAfterTime', inputs: [], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'getDataHash', inputs: [], outputs: [{ name: 'dataHash', type: 'uint256' }] },
  { type: 'function', name: 'getUnlockBlock', inputs: [], outputs: [{ name: 'unlockBlock', type: 'uint256' }] },
  { type: 'function', name: 'getTimeRemaining', inputs: [], outputs: [{ name: 'remaining', type: 'uint256' }] },
  { type: 'function', name: 'getIsActive', inputs: [], outputs: [{ name: 'isActive', type: 'bool' }] },
  { type: 'function', name: 'getVaultCount', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
];

export const BENEFICIARYVAULT_ABI = [
  { type: 'function', name: 'createVault', inputs: [
    { name: 'dataHash', type: 'uint256' },
    { name: 'beneficiary', type: 'address' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'unlockByBeneficiary', inputs: [], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'getDataHash', inputs: [], outputs: [{ name: 'dataHash', type: 'uint256' }] },
  { type: 'function', name: 'getBeneficiary', inputs: [], outputs: [{ name: 'beneficiary', type: 'address' }] },
  { type: 'function', name: 'getIsActive', inputs: [], outputs: [{ name: 'isActive', type: 'bool' }] },
  { type: 'function', name: 'getVaultCount', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
];

export const DEADMANVAULT_ABI = [
  { type: 'function', name: 'createVault', inputs: [
    { name: 'dataHash', type: 'uint256' },
    { name: 'beneficiary', type: 'address' },
    { name: 'deadManInterval', type: 'uint256' },
  ], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'ping', inputs: [], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'unlockByDeadManSwitch', inputs: [], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'getDataHash', inputs: [], outputs: [{ name: 'dataHash', type: 'uint256' }] },
  { type: 'function', name: 'getBeneficiary', inputs: [], outputs: [{ name: 'beneficiary', type: 'address' }] },
  { type: 'function', name: 'getDeadManInterval', inputs: [], outputs: [{ name: 'interval', type: 'uint256' }] },
  { type: 'function', name: 'getLastPing', inputs: [], outputs: [{ name: 'lastPing', type: 'uint256' }] },
  { type: 'function', name: 'getRemainingBlocks', inputs: [], outputs: [{ name: 'remaining', type: 'uint256' }] },
  { type: 'function', name: 'getIsActive', inputs: [], outputs: [{ name: 'isActive', type: 'bool' }] },
  { type: 'function', name: 'getVaultCount', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
];

// VaultFactory ABI
export const VAULTFACTORY_ABI = [
  { type: 'function', name: 'registerVaultDeployment', inputs: [
    { name: 'vaultAddress', type: 'address' },
    { name: 'vaultType', type: 'uint256' },
    { name: 'deployer', type: 'address' }
  ], outputs: [{ name: 'totalVaults', type: 'uint256' }] },
  
  { type: 'function', name: 'getFactoryStats', inputs: [], outputs: [
    { name: 'owner', type: 'address' },
    { name: 'totalVaultsDeployed', type: 'uint256' },
    { name: 'registryVersion', type: 'uint256' },
    { name: 'feeBasisPoints', type: 'uint256' },
    { name: 'collectedFees', type: 'uint256' },
    { name: 'lastDeployedBlock', type: 'uint256' }
  ] },
  
  { type: 'function', name: 'updateFee', inputs: [
    { name: 'newFeeBasisPoints', type: 'uint256' }
  ], outputs: [{ name: 'success', type: 'bool' }] },
  
  { type: 'function', name: 'getTotalVaults', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
  
  { type: 'function', name: 'getRegistryVersion', inputs: [], outputs: [{ name: 'version', type: 'uint256' }] },
  
  { type: 'function', name: 'transferOwnership', inputs: [
    { name: 'newOwner', type: 'address' }
  ], outputs: [{ name: 'success', type: 'bool' }] },
];

// AccessAudit ABI
export const ACCESSAUDIT_ABI = [
  { type: 'function', name: 'logEvent', inputs: [
    { name: 'eventType', type: 'uint256' },
    { name: 'vaultAddress', type: 'address' }
  ], outputs: [{ name: 'success', type: 'bool' }] },
  
  { type: 'function', name: 'getAuditStats', inputs: [], outputs: [
    { name: 'totalEvents', type: 'uint256' },
    { name: 'vaultCreations', type: 'uint256' },
    { name: 'unlockAttempts', type: 'uint256' },
    { name: 'unlockSuccesses', type: 'uint256' },
    { name: 'unlockFailures', type: 'uint256' },
    { name: 'beneficiaryClaims', type: 'uint256' },
    { name: 'deadManTriggers', type: 'uint256' },
    { name: 'lastEventBlock', type: 'uint256' }
  ] },
  
  { type: 'function', name: 'setAuthorizedLogger', inputs: [
    { name: 'logger', type: 'address' }
  ], outputs: [{ name: 'success', type: 'bool' }] },
  
  { type: 'function', name: 'getTotalEvents', inputs: [], outputs: [{ name: 'count', type: 'uint256' }] },
];

function normalizeAbiType(type: string) {
  if (typeof type !== 'string') return type;
  const key = type.toUpperCase();
  if (Object.prototype.hasOwnProperty.call(ABIDataTypes, key)) {
    return (ABIDataTypes as any)[key];
  }
  throw new Error(`Unknown ABI type: ${type}`);
}

function normalizeAbi(abi: any[]) {
  return abi.map((entry) => ({
    ...entry,
    type:
      typeof entry.type === 'string' && entry.type.toLowerCase() === 'function'
        ? BitcoinAbiTypes.Function
        : entry.type,
    inputs: (entry.inputs || []).map((input: any) => ({
      ...input,
      type: normalizeAbiType(input.type),
    })),
    outputs: (entry.outputs || []).map((output: any) => ({
      ...output,
      type: normalizeAbiType(output.type),
    })),
  }));
}

let providerPromise: Promise<JSONRpcProvider> | null = null;

async function getProvider(): Promise<JSONRpcProvider> {
  if (!providerPromise) {
    providerPromise = (async () => {
      return new JSONRpcProvider({
        url: RPC_URL,
        network: networks.opnetTestnet,
      });
    })();
  }
  return providerPromise;
}

export async function waitForContractAvailability(contractAddress: string, attempts = 15, delayMs = 2000): Promise<boolean> {
  if (!contractAddress) {
    return false;
  }

  return true;
}

export async function getCryptexBTCContract(contractAddress: string, abi: any[]) {
  if (!contractAddress) {
    throw new Error('Contract address not provided');
  }

  const provider = await getProvider();
  const typedAbi = normalizeAbi(abi);

  console.log(`[CryptexBTC] Loading contract at: ${contractAddress}`);
  return getContract(contractAddress, typedAbi, provider, networks.opnetTestnet);
}

export async function callWriteMethod({ 
  contract, 
  methodName, 
  args = [], 
  senderAddress 
}: {
  contract: any;
  methodName: string;
  args?: any[];
  senderAddress: string;
}) {
  if (!senderAddress) {
    throw new Error('Wallet address required');
  }
  if (typeof contract[methodName] !== 'function') {
    throw new Error(`Method '${methodName}' not found on contract`);
  }

  console.log(`[CryptexBTC] Calling ${methodName} with args:`, args);

  try {
    const simulation = await contract[methodName](...args);
    if (simulation?.revert) {
      throw new Error(`Contract revert: ${simulation.revert}`);
    }

    const receipt = await simulation.sendTransaction({
      refundTo: senderAddress,
      feeRate: 1,
      maximumAllowedSatToSpend: 30000n,
      network: networks.opnetTestnet,
    });

    const txid = receipt?.transactionId || receipt?.txid || String(receipt);
    console.log(`[CryptexBTC] Transaction ${methodName} completed:`, txid);

    return {
      ok: true,
      txid,
      explorerUrl: `${EXPLORER_BASE}/${txid}?network=${NETWORK_PARAM}`,
    };
  } catch (error: any) {
    console.error(`[CryptexBTC] Error in ${methodName}:`, error);

    if (error.message?.includes('signer is not allowed in interaction parameters')) {
      throw new Error('Wallet interaction error: Please check your OP_NET wallet extension and try again.');
    }

    if (error.message?.includes('out of memory')) {
      throw new Error('Contract memory error: The contract may be too complex. Try simplifying the operation.');
    }

    throw error;
  }
}

// Generate OP_NET account explorer URL
export function getAccountExplorerUrl(address: string): string {
  return `${ACCOUNT_EXPLORER_BASE}/${address}?network=${NETWORK_PARAM}`;
}

export async function callViewMethod({ 
  contract, 
  methodName, 
  args = [] 
}: {
  contract: any;
  methodName: string;
  args?: any[];
}) {
  if (typeof contract[methodName] !== 'function') {
    throw new Error(`Method '${methodName}' not found on contract`);
  }

  try {
    const result = await contract[methodName](...args);
    if (result?.revert) {
      throw new Error(`Contract revert: ${result.revert}`);
    }

    let properties = {};
    try {
      properties = result?.properties || {};
    } catch (bufferError: any) {
      console.warn(`[CryptexBTC] Buffer reading error for ${methodName}:`, bufferError.message);
      if (result && typeof result === 'object') {
        properties = { raw: result };
      }
    }

    return {
      ok: true,
      properties,
    };
  } catch (error: any) {
    console.error(`[CryptexBTC] Error in ${methodName}:`, error);
    return {
      ok: false,
      error: error.message || String(error),
      properties: {},
    };
  }
}
