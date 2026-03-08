import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Unlock, Clock, Users, Zap, Heart,
  Copy, ExternalLink, Trash2, RefreshCw, ChevronLeft,
  CheckCircle, AlertTriangle, Activity, Key, ArrowRight
} from 'lucide-react';
import { loadVaultById, updateVault, deleteVault } from '../lib/storage';
import { shortenAddress, shortenHash } from '../lib/crypto';
import { getAccountExplorerUrl } from '../services/contractService';
import type { Vault } from '../types/vault';

export default function VaultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vault, setVault] = useState<Vault | null>(null);
  const [copied, setCopied] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const v = loadVaultById(id);
      setVault(v);
    }
  }, [id]);

  if (!vault) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-vault-muted-dark mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-vault-text mb-2">Vault Not Found</h2>
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2 mt-4">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handlePing = async () => {
    setPingLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const updated = { ...vault, lastPing: Math.floor(Date.now() / 600_000) };
    updateVault(vault.id, updated);
    setVault(updated);
    setPingLoading(false);
  };

  const handleDelete = () => {
    deleteVault(vault.id);
    navigate('/dashboard');
  };

  const unlockTypeLabel = {
    password: 'Password Protected',
    time: 'Time Lock',
    beneficiary: 'Beneficiary Access',
    deadman: 'Dead Man Switch',
  }[vault.unlockType];

  const vaultTypeIcon = {
    general: Shield,
    inheritance: Heart,
    time_capsule: Clock,
    dead_man: Zap,
    proof_of_secret: Shield,
  }[vault.vaultType];

  const VaultIcon = vaultTypeIcon;

  const deadManElapsed = vault.lastPing
    ? Math.floor(Date.now() / 600_000) - vault.lastPing
    : 0;
  const deadManRemaining = vault.deadManInterval
    ? Math.max(0, vault.deadManInterval - deadManElapsed)
    : null;
  const deadManTriggered = deadManRemaining !== null && deadManRemaining === 0;

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-vault-muted hover:text-vault-text text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-4 relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${vault.isUnlocked ? 'bg-gradient-to-r from-transparent via-vault-success to-transparent' : 'bg-gradient-to-r from-transparent via-vault-accent to-transparent'}`} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-vault-accent-dim border border-vault-accent/20 flex items-center justify-center shrink-0">
                <VaultIcon className="w-7 h-7 text-vault-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-vault-text mb-1">{vault.title}</h1>
                {vault.description && <p className="text-vault-muted text-sm mb-2">{vault.description}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${vault.isUnlocked ? 'badge-green' : 'badge-orange'}`}>
                    {vault.isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {vault.isUnlocked ? 'Unlocked' : 'Sealed'}
                  </span>
                  <span className="badge badge-blue">{unlockTypeLabel}</span>
                  {vault.isPublic && <span className="badge badge-green">Public</span>}
                </div>
              </div>
            </div>

            {!vault.isUnlocked && (
              <Link
                to={`/vault/${vault.id}/unlock`}
                className="btn-primary shrink-0 flex items-center gap-2 text-sm"
              >
                <Key className="w-4 h-4" />
                Unlock
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Vault Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-vault-text mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-vault-accent" />
              Vault Info
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Contract', value: shortenAddress(vault.contractAddress), copy: vault.contractAddress },
                { label: 'Owner', value: shortenAddress(vault.owner), copy: vault.owner },
                { label: 'Data Hash', value: shortenHash(vault.dataHash), copy: vault.dataHash },
                { label: 'Created', value: `Block #${vault.createdAt.toLocaleString()}` },
                { label: 'Access Count', value: vault.accessCount.toString() },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-vault-muted text-xs">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-vault-text text-xs font-mono">{item.value}</span>
                    {item.copy && (
                      <button onClick={() => copy(item.copy!, item.label)} className="text-vault-muted hover:text-vault-accent transition-colors">
                        {copied === item.label ? <CheckCircle className="w-3 h-3 text-vault-success" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Unlock Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-vault-text mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-vault-accent" />
              Unlock Conditions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-vault-muted text-xs">Method</span>
                <span className="text-vault-text text-xs font-medium">{unlockTypeLabel}</span>
              </div>
              {vault.beneficiary && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-vault-muted text-xs">Beneficiary</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-vault-text text-xs font-mono">{shortenAddress(vault.beneficiary)}</span>
                    <button onClick={() => copy(vault.beneficiary!, 'Beneficiary')} className="text-vault-muted hover:text-vault-accent">
                      {copied === 'Beneficiary' ? <CheckCircle className="w-3 h-3 text-vault-success" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
              {vault.unlockBlock && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-vault-muted text-xs">Unlock Block</span>
                  <span className="text-vault-text text-xs font-mono">#{vault.unlockBlock.toLocaleString()}</span>
                </div>
              )}
              {vault.proofTimestamp && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-vault-muted text-xs">Proof Timestamp</span>
                  <span className="text-vault-text text-xs font-mono">Block #{vault.proofTimestamp.toLocaleString()}</span>
                </div>
              )}
            </div>

            {!vault.isUnlocked && (
              <Link to={`/vault/${vault.id}/unlock`} className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-4">
                <Unlock className="w-4 h-4" />
                Unlock Vault
              </Link>
            )}
          </motion.div>

          {/* Dead Man Switch */}
          {vault.unlockType === 'deadman' && vault.deadManInterval && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`glass-card p-5 md:col-span-2 ${deadManTriggered ? 'border border-vault-danger/30' : ''}`}
            >
              <h3 className="font-display font-semibold text-vault-text mb-4 flex items-center gap-2">
                <Zap className={`w-4 h-4 ${deadManTriggered ? 'text-vault-danger' : 'text-yellow-400'}`} />
                Dead Man Switch Status
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-vault-muted text-xs mb-1">Blocks until trigger</div>
                  <div className={`font-display text-2xl font-bold ${deadManTriggered ? 'text-vault-danger' : 'text-vault-text'}`}>
                    {deadManTriggered ? 'TRIGGERED' : deadManRemaining?.toLocaleString()}
                  </div>
                  {deadManRemaining !== null && deadManRemaining > 0 && (
                    <div className="text-vault-muted text-xs mt-1">
                      ≈ {Math.floor(deadManRemaining / 144)} days remaining
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePing}
                  disabled={pingLoading}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${pingLoading ? 'animate-spin' : ''}`} />
                  Ping (I'm Alive)
                </button>
              </div>
              {deadManTriggered && (
                <div className="p-3 rounded-xl bg-vault-danger/10 border border-vault-danger/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-vault-danger shrink-0" />
                  <p className="text-vault-danger text-xs">Dead Man Switch has triggered. Beneficiary can now claim this vault.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 md:col-span-2">
            <h3 className="font-display font-semibold text-vault-text mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={getAccountExplorerUrl(vault.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on OP_NET
              </a>
              <button
                onClick={() => copy(vault.contractAddress, 'contract')}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                {copied === 'contract' ? <CheckCircle className="w-4 h-4 text-vault-success" /> : <Copy className="w-4 h-4" />}
                Copy Address
              </button>
              {!showDelete ? (
                <button onClick={() => setShowDelete(true)} className="btn-ghost flex items-center gap-2 text-sm text-vault-danger hover:border-vault-danger/30">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-vault-danger text-sm">Confirm delete?</span>
                  <button onClick={handleDelete} className="text-vault-danger hover:underline text-sm font-medium">Yes</button>
                  <button onClick={() => setShowDelete(false)} className="text-vault-muted hover:text-vault-text text-sm">No</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
