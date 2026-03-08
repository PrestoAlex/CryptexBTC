import { JSONRpcProvider } from 'opnet';
import { networks, Network } from '@btc-vision/bitcoin';

export interface OPNetWallet {
  address: string;
  p2tr: string;
  network: Network;
  provider: JSONRpcProvider;
  extensionProvider: unknown;
}

export interface OPNetConfig {
  rpcUrl?: string;
  network?: 'testnet' | 'mainnet' | 'regtest';
}

const NETWORKS: Record<string, Network> = {
  mainnet: networks.bitcoin,
  testnet: networks.opnetTestnet,
  regtest: networks.regtest,
};

export class OPNetService {
  private wallet: OPNetWallet | null = null;
  private config: OPNetConfig;
  private provider: JSONRpcProvider;

  constructor(config: OPNetConfig = {}) {
    this.config = {
      rpcUrl: config.rpcUrl || 'https://testnet.opnet.org',
      network: config.network || 'testnet',
    };

    this.provider = new JSONRpcProvider({
      url: this.config.rpcUrl!,
      network: NETWORKS[this.config.network!],
      });
  }

  private getExtensionProvider(): any {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // Try multiple ways to access OP_NET provider
      const win = window as any;
      
      // Direct access (might be read-only)
      if (win.opnet) {
        return win.opnet;
      }
      
      // Through ethereum provider (some wallets inject it here)
      if (win.ethereum && win.ethereum.isOPNet) {
        return win.ethereum;
      }
      
      // Through global object
      if (win.OP_NET) {
        return win.OP_NET;
      }
    } catch (error) {
      console.warn('Error accessing OP_NET provider:', error);
    }

    return null;
  }

  private async waitForExtensionProvider(timeoutMs = 4000, intervalMs = 200): Promise<any> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const provider = this.getExtensionProvider();
      if (provider) {
        return provider;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return null;
  }

  private async callProvider(methods: string[], params: unknown[] = []) {
    const extensionProvider = await this.waitForExtensionProvider();

    if (!extensionProvider) {
      throw new Error('OP_NET Wallet extension not detected or blocked by another browser extension');
    }

    if (typeof extensionProvider?.request === 'function') {
      for (const method of methods) {
        try {
          return await extensionProvider.request({ method, params });
        } catch {
          // try next provider method name
        }
      }
    }

    for (const method of methods) {
      if (typeof extensionProvider[method] === 'function') {
        try {
          return await extensionProvider[method](...params);
        } catch {
          // try next provider method name
        }
      }
    }

    throw new Error('No compatible OP_NET wallet API method found');
  }

  async connectWallet(): Promise<OPNetWallet> {
    const network = NETWORKS[this.config.network!];
    const extensionProvider = await this.waitForExtensionProvider();

    if (!extensionProvider) {
      throw new Error('OP_NET Wallet extension not available. Disable conflicting wallet extensions and reload the page.');
    }

    const accounts = await this.callProvider(['request_accounts', 'requestAccounts'], []);

    if (!accounts || !accounts.length) {
      throw new Error('No wallet accounts returned');
    }

    const address = accounts[0] as string;

    this.wallet = {
      address,
      p2tr: address,
      network,
      provider: this.provider,
      extensionProvider,
    };

    return this.wallet;
  }

  async disconnectWallet(): Promise<void> {
    const extensionProvider = this.getExtensionProvider();
    if (extensionProvider && typeof extensionProvider.disconnect === 'function') {
      try {
        await extensionProvider.disconnect();
      } catch {
        // local cleanup still happens
      }
    }

    this.wallet = null;
  }

  getWallet(): OPNetWallet | null {
    return this.wallet;
  }

  async restoreWallet(): Promise<OPNetWallet | null> {
    const extensionProvider = await this.waitForExtensionProvider(2500, 150);

    if (!extensionProvider) {
      return null;
    }

    try {
      const accounts = await this.callProvider(['get_accounts', 'getAccounts'], []);
      if (!accounts || !accounts.length) {
        this.wallet = null;
        return null;
      }

      const network = NETWORKS[this.config.network!];
      const address = accounts[0] as string;

      this.wallet = {
        address,
        p2tr: address,
        network,
        provider: this.provider,
        extensionProvider,
      };

      return this.wallet;
    } catch {
      this.wallet = null;
      return null;
    }
  }

  async getBalance(): Promise<number> {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const balance = await this.callProvider(['get_balance', 'getBalance'], []);
      return Number(balance?.total ?? balance?.confirmed ?? balance ?? 0);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  async sendTransaction(to: string, amount: number, data?: Uint8Array) {
    await this.callProvider(['send_transaction', 'sendTransaction'], [to, amount, data]);
    return '';
  }

  async getTransaction(txId: string) {
    return await this.provider.getTransaction(txId);
  }

  async callContract(contractAddress: string, method: string, calldata?: Uint8Array) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      // For now, use simple call without calldata
      const result = await this.provider.call(contractAddress, method);

      return result;
    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const opnetService = new OPNetService();
