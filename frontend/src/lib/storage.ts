import type { Vault } from '../types/vault';

const VAULTS_KEY = 'cryptexbtc_vaults';
const WALLET_KEY = 'cryptexbtc_wallet';

export function saveVault(vault: Vault): void {
  const vaults = loadVaults();
  const idx = vaults.findIndex(v => v.id === vault.id);
  if (idx >= 0) {
    vaults[idx] = vault;
  } else {
    vaults.unshift(vault);
  }
  localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
}

export function loadVaults(): Vault[] {
  try {
    const raw = localStorage.getItem(VAULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadVaultById(id: string): Vault | null {
  const vaults = loadVaults();
  return vaults.find(v => v.id === id) ?? null;
}

export function deleteVault(id: string): void {
  const vaults = loadVaults().filter(v => v.id !== id);
  localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
}

export function updateVault(id: string, updates: Partial<Vault>): void {
  const vaults = loadVaults();
  const idx = vaults.findIndex(v => v.id === id);
  if (idx >= 0) {
    vaults[idx] = { ...vaults[idx], ...updates };
    localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  }
}

export function saveWalletAddress(address: string): void {
  localStorage.setItem(WALLET_KEY, address);
}

export function loadWalletAddress(): string | null {
  return localStorage.getItem(WALLET_KEY);
}

export function clearWallet(): void {
  localStorage.removeItem(WALLET_KEY);
}
