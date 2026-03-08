import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Shield, Lock, Unlock, Clock, Zap, Heart,
  Search, Filter, LayoutGrid, List, Activity
} from 'lucide-react';
import VaultCard from '../components/VaultCard';
import { loadVaults } from '../lib/storage';
import type { Vault, VaultType } from '../types/vault';

const FILTER_OPTIONS: { value: VaultType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Vaults' },
  { value: 'general', label: 'Secrets' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'time_capsule', label: 'Time Capsules' },
  { value: 'dead_man', label: 'Dead Man' },
  { value: 'proof_of_secret', label: 'Proof' },
];

export default function DashboardPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VaultType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setVaults(loadVaults());
  }, []);

  const filtered = vaults.filter(v => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || v.vaultType === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: vaults.length,
    locked: vaults.filter(v => !v.isUnlocked).length,
    unlocked: vaults.filter(v => v.isUnlocked).length,
    timeCapsules: vaults.filter(v => v.vaultType === 'time_capsule').length,
    inheritance: vaults.filter(v => v.vaultType === 'inheritance').length,
    deadMan: vaults.filter(v => v.vaultType === 'dead_man').length,
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-vault-text">My Vaults</h1>
            <p className="text-vault-muted text-sm mt-1">
              {vaults.length} vault{vaults.length !== 1 ? 's' : ''} secured on Bitcoin
            </p>
          </div>
          <Link to="/vault/create" className="btn-primary flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New Vault
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {[
            { label: 'Total', value: stats.total, icon: Shield, color: 'text-vault-accent' },
            { label: 'Locked', value: stats.locked, icon: Lock, color: 'text-vault-muted' },
            { label: 'Unlocked', value: stats.unlocked, icon: Unlock, color: 'text-vault-success' },
            { label: 'Time Caps.', value: stats.timeCapsules, icon: Clock, color: 'text-vault-secondary' },
            { label: 'Inherit.', value: stats.inheritance, icon: Heart, color: 'text-rose-400' },
            { label: 'Dead Man', value: stats.deadMan, icon: Zap, color: 'text-yellow-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card p-4 text-center"
            >
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <div className="font-display text-2xl font-bold text-vault-text">{s.value}</div>
              <div className="text-vault-muted text-xs mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
              <input
                className="input-vault pl-9"
                placeholder="Search vaults..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filter === opt.value
                      ? 'bg-vault-accent text-white'
                      : 'bg-white/5 text-vault-muted hover:text-vault-text hover:bg-white/8'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-vault-accent-dim text-vault-accent' : 'text-vault-muted hover:text-vault-text hover:bg-white/5'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-vault-accent-dim text-vault-accent' : 'text-vault-muted hover:text-vault-text hover:bg-white/5'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Vault list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-16 text-center"
          >
            <Shield className="w-16 h-16 text-vault-muted-dark mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-vault-text mb-2">
              {vaults.length === 0 ? 'No Vaults Yet' : 'No Results Found'}
            </h3>
            <p className="text-vault-muted text-sm mb-6">
              {vaults.length === 0
                ? 'Create your first encrypted vault on Bitcoin.'
                : 'Try adjusting your search or filters.'}
            </p>
            {vaults.length === 0 && (
              <Link to="/vault/create" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create First Vault
              </Link>
            )}
          </motion.div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }>
            {filtered.map((vault, i) => (
              <VaultCard key={vault.id} vault={vault} index={i} />
            ))}
          </div>
        )}

        {/* Activity footer */}
        {vaults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass-card p-4 flex items-center gap-3"
          >
            <Activity className="w-4 h-4 text-vault-accent" />
            <span className="text-vault-muted text-sm">
              All vaults are anchored on Bitcoin L1 via OP_NET smart contracts.
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
