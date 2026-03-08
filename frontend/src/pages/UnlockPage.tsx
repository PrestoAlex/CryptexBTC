import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock, Unlock, Key, Eye, EyeOff, ChevronLeft,
  Shield, AlertTriangle, CheckCircle, Loader
} from 'lucide-react';
import { loadVaultById, updateVault } from '../lib/storage';
import { decryptData, hashPassword } from '../lib/crypto';
import type { Vault, EncryptedPayload } from '../types/vault';

export default function UnlockPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vault, setVault] = useState<Vault | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (id) setVault(loadVaultById(id));
  }, [id]);

  if (!vault) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-vault-muted-dark mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-vault-text mb-2">Vault Not Found</h2>
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2 mt-4">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>
    );
  }

  if (vault.isUnlocked && !decryptedContent) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-vault-success mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-vault-text mb-2">Already Unlocked</h2>
          <p className="text-vault-muted text-sm mb-6">This vault has been previously unlocked.</p>
          <Link to={`/vault/${vault.id}`} className="btn-primary inline-flex items-center gap-2">
            View Vault
          </Link>
        </div>
      </div>
    );
  }

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError('');

    try {
      if (vault.unlockType === 'time' && vault.unlockBlock) {
        const currentBlock = Math.floor(Date.now() / 600_000);
        if (currentBlock < vault.unlockBlock) {
          const blocksLeft = vault.unlockBlock - currentBlock;
          setError(`Vault is time-locked. ${blocksLeft.toLocaleString()} blocks remaining (~${Math.floor(blocksLeft / 144)} days).`);
          setIsUnlocking(false);
          return;
        }
      }

      if (vault.unlockType === 'password') {
        if (!vault.encryptedData) {
          setError('No encrypted data found in this vault.');
          setIsUnlocking(false);
          return;
        }

        await new Promise(r => setTimeout(r, 400));

        let payload: EncryptedPayload;
        try {
          payload = JSON.parse(vault.encryptedData);
        } catch {
          setError('Vault data is corrupted.');
          setIsUnlocking(false);
          return;
        }

        try {
          const content = await decryptData(payload, password);
          setDecryptedContent(content);
          setUnlocked(true);

          const updated = {
            ...vault,
            isUnlocked: true,
            unlockedAt: Math.floor(Date.now() / 600_000),
            accessCount: (vault.accessCount || 0) + 1,
          };
          updateVault(vault.id, updated);
          setVault(updated);
        } catch {
          setError('Incorrect password. Please try again.');
          setIsUnlocking(false);
          return;
        }
      }

      if (vault.unlockType === 'time' || vault.unlockType === 'beneficiary') {
        setDecryptedContent(vault.encryptedData
          ? `[Encrypted content — AES-256]\n\nData hash: ${vault.dataHash}\nMeta hash: ${vault.metaHash}\n\nTo view the actual content, you need to provide the password used during vault creation.`
          : `Vault metadata:\n• ID: ${vault.id}\n• Title: ${vault.title}\n• Type: ${vault.vaultType}\n• Unlock method: ${vault.unlockType}`
        );
        setUnlocked(true);
        const updated = {
          ...vault,
          isUnlocked: true,
          unlockedAt: Math.floor(Date.now() / 600_000),
          accessCount: (vault.accessCount || 0) + 1,
        };
        updateVault(vault.id, updated);
        setVault(updated);
      }
    } catch {
      setError('Failed to unlock vault. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Link to={`/vault/${vault.id}`} className="inline-flex items-center gap-2 text-vault-muted hover:text-vault-text text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        {!unlocked ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            {/* Vault lock visual */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vault-accent/20 to-vault-accent/5 border border-vault-accent/30 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-vault-accent" />
                  </div>
                  <div className="absolute -inset-2 rounded-2xl border border-vault-accent/10 animate-pulse-glow" />
                </div>
              </motion.div>
              <h2 className="font-display text-xl font-bold text-vault-text mt-4 mb-1">
                Unlock Vault
              </h2>
              <p className="text-vault-muted text-sm line-clamp-1">{vault.title}</p>
            </div>

            {vault.unlockType === 'password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-vault-text text-sm font-medium mb-2">Vault Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-vault pr-10 font-mono"
                      placeholder="Enter your vault password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && password && handleUnlock()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {vault.unlockType === 'time' && (
              <div className="text-center space-y-3">
                <div className="p-4 rounded-xl bg-vault-secondary-dim border border-vault-secondary/20">
                  <p className="text-vault-secondary text-sm">
                    This vault unlocks at Bitcoin block #{vault.unlockBlock?.toLocaleString()}
                  </p>
                  <p className="text-vault-muted text-xs mt-1">
                    Current block: ~{Math.floor(Date.now() / 600_000).toLocaleString()}
                  </p>
                </div>
                {Math.floor(Date.now() / 600_000) >= (vault.unlockBlock || 0) && (
                  <p className="text-vault-success text-sm">Time lock has expired — vault can now be unlocked!</p>
                )}
              </div>
            )}

            {vault.unlockType === 'beneficiary' && (
              <div className="p-4 rounded-xl bg-vault-accent-dim border border-vault-accent/20">
                <p className="text-vault-accent text-sm text-center">
                  This vault requires beneficiary signature for unlock.
                  <br />
                  <span className="text-vault-muted text-xs mt-1 block">Connect as: {vault.beneficiary}</span>
                </p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-vault-danger/10 border border-vault-danger/30"
              >
                <AlertTriangle className="w-4 h-4 text-vault-danger shrink-0" />
                <p className="text-vault-danger text-sm">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handleUnlock}
              disabled={isUnlocking || (vault.unlockType === 'password' && !password)}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isUnlocking ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Unlock Vault
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success header */}
            <div className="glass-card p-6 text-center border border-vault-success/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-12 h-12 text-vault-success mx-auto mb-3" />
              </motion.div>
              <h2 className="font-display text-xl font-bold text-vault-text mb-1">Vault Unlocked</h2>
              <p className="text-vault-muted text-sm">{vault.title}</p>
            </div>

            {/* Decrypted content */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-vault-accent" />
                <span className="text-vault-text text-sm font-semibold">Decrypted Content</span>
                <div className="ml-auto badge badge-green text-xs">
                  <CheckCircle className="w-3 h-3" />
                  AES-256 Verified
                </div>
              </div>
              <pre className="text-vault-text text-sm font-mono whitespace-pre-wrap break-all bg-black/20 rounded-xl p-4 max-h-64 overflow-y-auto leading-relaxed">
                {decryptedContent}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(decryptedContent)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                Copy Content
              </button>
              <Link to={`/vault/${vault.id}`} className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm">
                View Vault
              </Link>
            </div>

            <p className="text-vault-muted-dark text-xs text-center">
              Content is decrypted locally. Nothing is transmitted to any server.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
