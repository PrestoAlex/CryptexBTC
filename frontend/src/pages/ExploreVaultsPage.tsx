import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, Clock, Zap, Heart, Shield, FileText, Lock, TrendingUp } from 'lucide-react';
import VaultCard from '../components/VaultCard';
import { loadVaults } from '../lib/storage';
import type { Vault, VaultType } from '../types/vault';

const SAMPLE_VAULTS: Vault[] = [
  {
    id: 'demo-1',
    contractAddress: 'bc1p3k9mxqrs7yz2j4ndf8gvwq6lzp4t5vhe8xkc2r0yu7ms3p1a6sdnl2k4p',
    title: 'Bitcoin Genesis Message',
    description: 'A sealed message to be opened in 2035. Contains thoughts on Bitcoin\'s future.',
    vaultType: 'time_capsule',
    unlockType: 'time',
    dataHash: 'a3f2b8c94d1e7f605a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    metaHash: 'b4e5c9d0e2f8a706b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    owner: 'bc1p9x8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3',
    unlockBlock: 1_050_000,
    isUnlocked: false,
    isActive: true,
    createdAt: 840_000,
    accessCount: 147,
    isPublic: true,
    tags: ['bitcoin', 'future', 'time-capsule'],
    proofTimestamp: 840_000,
  },
  {
    id: 'demo-2',
    contractAddress: 'bc1p4l0nyqrs8az3k5oeg9hwxr7mp5u6wif9ylkc3s1zv8nt4q2b7tejm3l5q',
    title: 'Digital Will — Estate Alpha',
    description: 'Inheritance vault with beneficiary access. Contains asset distribution instructions.',
    vaultType: 'inheritance',
    unlockType: 'beneficiary',
    dataHash: 'c5f6d0e1f3a9b807c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    metaHash: 'd6a7e1f2a4b0c908d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    owner: 'bc1p8w7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5',
    beneficiary: 'bc1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5',
    isUnlocked: false,
    isActive: true,
    createdAt: 845_000,
    accessCount: 3,
    isPublic: true,
    tags: ['inheritance', 'legal', 'family'],
  },
  {
    id: 'demo-3',
    contractAddress: 'bc1p5m1ozrst9ba4l6pfh0ixys8nq6v7xjg0zmld4t2aw9ou5r3c8ufkn4m6r',
    title: 'Proof of Discovery — 2024',
    description: 'Cryptographic proof that a scientific discovery was made on this date.',
    vaultType: 'proof_of_secret',
    unlockType: 'password',
    dataHash: 'e7b8f2a3b5c1d009e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    metaHash: 'f8c9a3b4c6d2e10af7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    owner: 'bc1p7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6',
    isUnlocked: false,
    isActive: true,
    createdAt: 850_000,
    accessCount: 89,
    isPublic: true,
    tags: ['proof', 'science', 'notarization'],
    proofTimestamp: 850_000,
  },
  {
    id: 'demo-4',
    contractAddress: 'bc1p6n2paztu0cb5m7qgi1jyzt9or7w8ykh1anme5u3bx0pv6s4d9vglo5n7s',
    title: 'Dead Man Protocol — Omega',
    description: 'Auto-releases critical information if the owner goes inactive for 180 days.',
    vaultType: 'dead_man',
    unlockType: 'deadman',
    dataHash: 'a9d0b4c5d7e3f21ba8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    metaHash: 'b0e1c5d6e8f4a32cb9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    owner: 'bc1p6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5',
    beneficiary: 'bc1p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5',
    deadManInterval: 25920,
    lastPing: 848_000,
    isUnlocked: false,
    isActive: true,
    createdAt: 830_000,
    accessCount: 12,
    isPublic: true,
    tags: ['dead-man', 'security', 'critical'],
  },
];

const TYPE_FILTERS: { value: VaultType | 'all'; label: string; icon: typeof Globe }[] = [
  { value: 'all', label: 'All', icon: Globe },
  { value: 'time_capsule', label: 'Time Capsules', icon: Clock },
  { value: 'inheritance', label: 'Inheritance', icon: Heart },
  { value: 'dead_man', label: 'Dead Man', icon: Zap },
  { value: 'proof_of_secret', label: 'Proof', icon: Shield },
  { value: 'general', label: 'Secrets', icon: FileText },
];

export default function ExploreVaultsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VaultType | 'all'>('all');
  const [allVaults, setAllVaults] = useState<Vault[]>([]);

  useEffect(() => {
    const myVaults = loadVaults().filter(v => v.isPublic);
    const combined = [...myVaults, ...SAMPLE_VAULTS];
    const unique = combined.filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i);
    setAllVaults(unique);
  }, []);

  const filtered = allVaults.filter(v => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || v.vaultType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center gap-2 badge badge-blue mb-4">
              <Globe className="w-4 h-4" />
              Public Vaults
            </div>
            <h1 className="font-display text-4xl font-bold text-vault-text mb-3">
              Explore Bitcoin Vaults
            </h1>
            <p className="text-vault-muted max-w-xl mx-auto">
              Browse public vaults anchored on Bitcoin L1. Each vault is a sealed secret with on-chain proof of existence.
            </p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-2 text-vault-muted text-sm">
            <TrendingUp className="w-4 h-4 text-vault-accent" />
            <span>{allVaults.length} public vaults on Bitcoin L1</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-vault-muted">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {allVaults.filter(v => !v.isUnlocked).length} sealed
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
              <input
                className="input-vault pl-9"
                placeholder="Search public vaults..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filter === f.value
                      ? 'bg-vault-secondary text-vault-bg'
                      : 'bg-white/5 text-vault-muted hover:text-vault-text hover:bg-white/8'
                  }`}
                >
                  <f.icon className="w-3 h-3" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center"
          >
            <Globe className="w-16 h-16 text-vault-muted-dark mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-vault-text mb-2">No Vaults Found</h3>
            <p className="text-vault-muted text-sm">Try different search terms or filters.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((vault, i) => (
              <VaultCard key={vault.id} vault={vault} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
