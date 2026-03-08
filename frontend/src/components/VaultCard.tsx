import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock, Unlock, Clock, Users, Heart, Zap, FileText,
  Shield, ChevronRight, Key
} from 'lucide-react';
import type { Vault } from '../types/vault';
import { shortenAddress } from '../lib/crypto';

interface VaultCardProps {
  vault: Vault;
  index?: number;
}

const vaultTypeConfig = {
  general: { icon: FileText, label: 'Secret', color: 'text-vault-muted', bg: 'bg-vault-muted/10' },
  inheritance: { icon: Heart, label: 'Inheritance', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  time_capsule: { icon: Clock, label: 'Time Capsule', color: 'text-vault-secondary', bg: 'bg-vault-secondary-dim' },
  dead_man: { icon: Zap, label: 'Dead Man', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  proof_of_secret: { icon: Shield, label: 'Proof', color: 'text-vault-success', bg: 'bg-vault-success/10' },
};

const unlockTypeConfig = {
  password: { icon: Key, label: 'Password', color: 'badge-orange' },
  time: { icon: Clock, label: 'Time Lock', color: 'badge-blue' },
  beneficiary: { icon: Users, label: 'Beneficiary', color: 'badge-green' },
  deadman: { icon: Zap, label: 'Dead Man', color: 'badge-red' },
};

export default function VaultCard({ vault, index = 0 }: VaultCardProps) {
  const typeConfig = vaultTypeConfig[vault.vaultType];
  const unlockConfig = unlockTypeConfig[vault.unlockType];
  const TypeIcon = typeConfig.icon;
  const UnlockIcon = unlockConfig.icon;

  const timeAgo = (block: number) => {
    const diff = Date.now() - block * 600_000;
    const days = Math.floor(diff / 86_400_000);
    if (days > 365) return `${Math.floor(days / 365)}y ago`;
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return 'Recently';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/vault/${vault.id}`} className="block group">
        <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
          {vault.isUnlocked && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-vault-success to-transparent opacity-60" />
          )}
          {!vault.isUnlocked && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-vault-accent to-transparent opacity-40" />
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center`}>
                <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-vault-text text-sm leading-tight line-clamp-1">
                  {vault.title}
                </h3>
                <p className="text-vault-muted text-xs mt-0.5">
                  {shortenAddress(vault.owner)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {vault.isUnlocked ? (
                <div className="flex items-center gap-1.5 badge badge-green">
                  <Unlock className="w-3 h-3" />
                  <span>Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 badge badge-orange">
                  <Lock className="w-3 h-3" />
                  <span>Sealed</span>
                </div>
              )}
            </div>
          </div>

          {vault.description && (
            <p className="text-vault-muted text-xs mb-4 line-clamp-2 leading-relaxed">
              {vault.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`badge ${unlockConfig.color} text-xs`}>
                <UnlockIcon className="w-3 h-3" />
                {unlockConfig.label}
              </div>
              <div className="badge badge-orange text-xs">
                {typeConfig.label}
              </div>
            </div>

            <div className="flex items-center gap-1 text-vault-muted-dark text-xs">
              <span>{timeAgo(vault.createdAt)}</span>
              <ChevronRight className="w-3 h-3 group-hover:text-vault-accent transition-colors" />
            </div>
          </div>

          {vault.unlockBlock && !vault.isUnlocked && vault.unlockType === 'time' && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-vault-secondary">
                <Clock className="w-3 h-3" />
                <span>Unlocks at block #{vault.unlockBlock.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
