import { useState, useCallback } from 'react';
import { Address } from '@btc-vision/transaction';
import { getCryptexBTCContract, callWriteMethod, callViewMethod } from '../services/contractService';
import {
  CRYPTEXBTC_CONTRACTS,
  DATAVAULT_ABI,
  TIMEVAULT_ABI,
  BENEFICIARYVAULT_ABI,
  DEADMANVAULT_ABI,
} from '../services/contractService';

function toSafeBigInt(value: string | number | boolean): bigint {
  if (typeof value === 'boolean') {
    return value ? 1n : 0n;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? BigInt(Math.max(0, Math.floor(value))) : 0n;
  }

  if (!value || value === 'NaN') {
    return 0n;
  }

  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return BigInt(`0x${value}`);
  }

  if (/^[0-9]+$/.test(value)) {
    return BigInt(value);
  }

  return 0n;
}

async function toOpNetAddress(value?: string, provider?: any): Promise<Address> {
  const address = value?.trim();

  if (!address) {
    throw new Error('Beneficiary address is required');
  }

  try {
    // Спочатку спробуємо Address.fromString напряму (якщо це вже публічний ключ)
    return Address.fromString(address);
  } catch (error) {
    // Якщо не вийшло, спробуємо отримати публічний ключ через provider
    if (provider && (address.startsWith('bc1p') || address.startsWith('opt1'))) {
      try {
        const info = await provider.getPublicKeyInfo(address);
        if (info && info.publicKey) {
          return Address.fromString(info.publicKey);
        }
      } catch (providerError) {
        console.warn('Failed to resolve public key from address:', providerError);
      }
    }
    
    throw new Error(`Invalid address format: ${address}. Please provide a valid public key (0x...) or bech32 address.`);
  }
}

type UnlockType = 'password' | 'time' | 'beneficiary' | 'deadman';

function getVaultContractConfig(unlockType: UnlockType) {
  switch (unlockType) {
    case 'time':
      return {
        address: CRYPTEXBTC_CONTRACTS.timeVaultTemplate,
        abi: TIMEVAULT_ABI,
      };
    case 'beneficiary':
      return {
        address: CRYPTEXBTC_CONTRACTS.beneficiaryVaultTemplate,
        abi: BENEFICIARYVAULT_ABI,
      };
    case 'deadman':
      return {
        address: CRYPTEXBTC_CONTRACTS.deadManVaultTemplate,
        abi: DEADMANVAULT_ABI,
      };
    case 'password':
    default:
      return {
        address: CRYPTEXBTC_CONTRACTS.dataVaultTemplate,
        abi: DATAVAULT_ABI,
      };
  }
}

export function useCryptexContracts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // DataVault operations
  const createVault = async (
    data: {
      unlockType: UnlockType;
      dataHash: string | number;
      passwordHash?: string | number;
      unlockBlock?: string | number;
      beneficiary?: string;
      deadManInterval?: string | number;
    },
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const config = getVaultContractConfig(data.unlockType);
      const contract = await getCryptexBTCContract(config.address, config.abi);
      let args: any[] = [];

      switch (data.unlockType) {
        case 'time':
          args = [
            toSafeBigInt(data.dataHash),
            toSafeBigInt(data.unlockBlock ?? 0),
          ];
          break;
        case 'beneficiary':
          args = [
            toSafeBigInt(data.dataHash),
            await toOpNetAddress(data.beneficiary, contract.provider),
          ];
          break;
        case 'deadman':
          args = [
            toSafeBigInt(data.dataHash),
            await toOpNetAddress(data.beneficiary, contract.provider),
            toSafeBigInt(data.deadManInterval ?? 0),
          ];
          break;
        case 'password':
        default:
          args = [
            toSafeBigInt(data.dataHash),
            toSafeBigInt(data.passwordHash ?? 0),
          ];
          break;
      }

      console.log('[CryptexBTC] createVault route', {
        unlockType: data.unlockType,
        contractAddress: config.address,
        methodName: 'createVault',
        args,
      });

      const result = await callWriteMethod({
        contract,
        methodName: 'createVault',
        args,
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const waitUntilVaultIndexed = useCallback(async (_vaultAddress: string) => {
    return true;
  }, []);

  const unlockWithPassword = useCallback(async (
    vaultAddress: string,
    passwordHash: string,
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, DATAVAULT_ABI);

      const result = await callWriteMethod({
        contract,
        methodName: 'unlockWithPassword',
        args: [passwordHash],
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to unlock vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlockAfterTime = useCallback(async (
    vaultAddress: string,
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, TIMEVAULT_ABI);

      const result = await callWriteMethod({
        contract,
        methodName: 'unlockAfterTime',
        args: [],
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to unlock vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const beneficiaryClaim = useCallback(async (
    vaultAddress: string,
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, BENEFICIARYVAULT_ABI);

      const result = await callWriteMethod({
        contract,
        methodName: 'unlockByBeneficiary',
        args: [],
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to claim vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deadManSwitchClaim = useCallback(async (
    vaultAddress: string,
    deadManInterval: string | number,
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, DEADMANVAULT_ABI);

      const result = await callWriteMethod({
        contract,
        methodName: 'unlockByDeadManSwitch',
        args: [toSafeBigInt(deadManInterval)],
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to claim vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ping = useCallback(async (
    vaultAddress: string,
    senderAddress: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, DEADMANVAULT_ABI);

      const result = await callWriteMethod({
        contract,
        methodName: 'ping',
        args: [],
        senderAddress,
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to ping vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // View methods
  const getVaultInfo = useCallback(async (vaultAddress: string, unlockType: UnlockType = 'password') => {
    setIsLoading(true);
    setError('');

    try {
      const config = getVaultContractConfig(unlockType);
      const contract = await getCryptexBTCContract(vaultAddress, config.abi);

      const methodName = unlockType === 'time'
        ? 'getUnlockBlock'
        : unlockType === 'beneficiary'
          ? 'getBeneficiary'
          : unlockType === 'deadman'
            ? 'getLastPing'
            : 'getDataHash';

      const result = await callViewMethod({
        contract,
        methodName,
        args: [],
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get vault info');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUnlockStatus = useCallback(async (vaultAddress: string, unlockType: UnlockType = 'password') => {
    setIsLoading(true);
    setError('');

    try {
      const config = getVaultContractConfig(unlockType);
      const contract = await getCryptexBTCContract(vaultAddress, config.abi);

      const methodName = unlockType === 'time'
        ? 'getIsActive'
        : unlockType === 'beneficiary'
          ? 'getIsActive'
          : unlockType === 'deadman'
            ? 'getBeneficiary'
            : 'getIsActive';

      const result = await callViewMethod({
        contract,
        methodName,
        args: [],
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get unlock status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDeadManStatus = useCallback(async (vaultAddress: string) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = await getCryptexBTCContract(vaultAddress, DEADMANVAULT_ABI);

      const result = await callViewMethod({
        contract,
        methodName: 'getLastPing',
        args: [],
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get dead man status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerVaultDeployment = useCallback(async () => {
    return { ok: true };
  }, []);

  const getFactoryStats = useCallback(async () => {
    return { ok: true, properties: {} };
  }, []);

  const getAuditStats = useCallback(async () => {
    return { ok: true, properties: {} };
  }, []);

  return {
    isLoading,
    error,
    clearError: () => setError(''),
    
    // DataVault methods
    createVault,
    waitUntilVaultIndexed,
    unlockWithPassword,
    unlockAfterTime,
    beneficiaryClaim,
    deadManSwitchClaim,
    ping,
    getVaultInfo,
    getUnlockStatus,
    getDeadManStatus,
    
    // Compatibility placeholders
    registerVaultDeployment,
    getFactoryStats,
    getAuditStats,
  };
}
