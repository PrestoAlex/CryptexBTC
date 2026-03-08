import { useState, useEffect, useCallback } from 'react';
import { opnetService, OPNetWallet } from '../lib/opnet';

export function useWallet() {
  const [wallet, setWallet] = useState<OPNetWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const connectedWallet = await opnetService.connectWallet();
      setWallet(connectedWallet);
      setIsConnected(true);
      
      const bal = await opnetService.getBalance();
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      await opnetService.disconnectWallet();
      setWallet(null);
      setIsConnected(false);
      setBalance(0);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!isConnected) return;

    try {
      const bal = await opnetService.getBalance();
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh balance');
    }
  }, [isConnected]);

  const sendTransaction = useCallback(async (to: string, amount: number, data?: Uint8Array) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      const txId = await opnetService.sendTransaction(to, amount, data);
      return txId;
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      throw err;
    }
  }, [isConnected]);

  const callContract = useCallback(async (contractAddress: string, method: string, calldata?: Uint8Array) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      const result = await opnetService.callContract(contractAddress, method, calldata);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to call contract');
      throw err;
    }
  }, [isConnected]);

  const getTransaction = useCallback(async (txId: string) => {
    try {
      const tx = await opnetService.getTransaction(txId);
      return tx;
    } catch (err: any) {
      setError(err.message || 'Failed to get transaction');
      throw err;
    }
  }, []);

  // Auto-restore wallet on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const restored = await opnetService.restoreWallet();
        if (restored) {
          setWallet(restored);
          setIsConnected(true);
          const bal = await opnetService.getBalance();
          setBalance(bal);
        }
      } catch (err: any) {
        console.error('Failed to restore wallet:', err);
        setError(err.message);
      }
    };
    restore();
  }, []);

  return {
    wallet,
    isConnected,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendTransaction,
    callContract,
    getTransaction,
    clearError: () => setError(''),
  };
}
