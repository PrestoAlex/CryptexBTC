import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Copy, CheckCircle, AlertTriangle,
  Bitcoin, LogOut, RefreshCw, ExternalLink
} from 'lucide-react';
import { opnetService, OPNetWallet } from '../lib/opnet';

interface WalletConnectProps {
  onWalletConnected?: (wallet: OPNetWallet) => void;
  onWalletDisconnected?: () => void;
}

export default function WalletConnect({ onWalletConnected, onWalletDisconnected }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<OPNetWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Restore wallet on mount
    const restore = async () => {
      try {
        const restored = await opnetService.restoreWallet();
        if (restored) {
          setWallet(restored);
          const bal = await opnetService.getBalance();
          setBalance(bal);
          onWalletConnected?.(restored);
        }
      } catch (err) {
        console.error('Failed to restore wallet:', err);
      }
    };
    restore();
  }, [onWalletConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const connectedWallet = await opnetService.connectWallet();
      setWallet(connectedWallet);
      
      const bal = await opnetService.getBalance();
      setBalance(bal);
      
      onWalletConnected?.(connectedWallet);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await opnetService.disconnectWallet();
      setWallet(null);
      setBalance(0);
      onWalletDisconnected?.();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  const handleRefresh = async () => {
    if (!wallet) return;
    
    try {
      const bal = await opnetService.getBalance();
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh balance');
    }
  };

  const copyAddress = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatBalance = (satoshis: number) => {
    const btc = satoshis / 100000000;
    return btc < 0.01 ? `${satoshis.toLocaleString()} sats` : `${btc.toFixed(8)} BTC`;
  };

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-accent-dim border border-vault-accent/20">
          <Bitcoin className="w-4 h-4 text-vault-accent" />
          <span className="text-vault-accent text-sm font-medium">
            {balance < 1000000 ? `${balance.toLocaleString()} sats` : `${(balance / 100000000).toFixed(4)} BTC`}
          </span>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-accent-dim border border-vault-accent/20 text-vault-accent text-sm font-medium hover:bg-vault-accent/10 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-accent-dim border border-vault-accent/20 text-vault-accent text-sm font-medium hover:bg-vault-accent/10 transition-colors disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-vault-accent/30 border-t-vault-accent rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Bitcoin className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-vault-danger/10 border border-vault-danger/30 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-vault-danger shrink-0" />
          <p className="text-vault-danger text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
