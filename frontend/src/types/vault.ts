export type UnlockType = 'password' | 'time' | 'beneficiary' | 'deadman';
export type VaultType = 'general' | 'inheritance' | 'time_capsule' | 'dead_man' | 'proof_of_secret';
export type VaultStatus = 'locked' | 'unlocked' | 'expired' | 'triggered';

export interface Vault {
  id: string;
  contractAddress: string;
  title: string;
  description: string;
  vaultType: VaultType;
  unlockType: UnlockType;
  dataHash: string;
  metaHash: string;
  owner: string;
  beneficiary?: string;
  unlockBlock?: number;
  deadManInterval?: number;
  lastPing?: number;
  isUnlocked: boolean;
  isActive: boolean;
  createdAt: number;
  unlockedAt?: number;
  accessCount: number;
  isPublic: boolean;
  tags: string[];
  proofTimestamp?: number;
  encryptedData?: string;
  ipfsCid?: string;
}

export interface CreateVaultForm {
  title: string;
  description: string;
  vaultType: VaultType;
  unlockType: UnlockType;
  content: string;
  password?: string;
  beneficiaryAddress?: string;
  unlockDate?: string;
  deadManDays?: number;
  isPublic: boolean;
  tags: string[];
}

export interface VaultStats {
  total: number;
  locked: number;
  unlocked: number;
  timeCapsules: number;
  inheritance: number;
  deadMan: number;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
  version: string;
  timestamp: number;
}
