import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Clock, Users, Zap, Eye, ArrowRight,
  Bitcoin, Globe, FileText, Key, CheckCircle, Star
} from 'lucide-react';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../hooks/useWallet';

const features = [
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    desc: 'All data encrypted client-side before touching the blockchain. Your keys, your secrets.',
    color: 'text-vault-accent',
    bg: 'bg-vault-accent-dim',
  },
  {
    icon: Clock,
    title: 'Time Capsules',
    desc: 'Seal messages that unlock at a specific Bitcoin block height. Perfect for future letters.',
    color: 'text-vault-secondary',
    bg: 'bg-vault-secondary-dim',
  },
  {
    icon: Users,
    title: 'Digital Inheritance',
    desc: 'Designate beneficiaries who can access your vault if you go inactive.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Zap,
    title: 'Dead Man Switch',
    desc: 'Automatically release your vault to beneficiaries if you stop confirming activity.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Eye,
    title: 'Proof of Secret',
    desc: 'Prove a secret existed at a specific time without revealing it. Cryptographic notarization.',
    color: 'text-vault-success',
    bg: 'bg-vault-success/10',
  },
  {
    icon: Globe,
    title: 'Bitcoin Native',
    desc: 'Anchored on Bitcoin L1 via OP_NET. Immutable, censorship-resistant, permanent.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

const useCases = [
  { icon: Key, title: 'Seed Phrase Backup', desc: 'Securely store your crypto recovery phrases' },
  { icon: FileText, title: 'Legal Documents', desc: 'Wills, contracts, power of attorney' },
  { icon: Shield, title: 'Personal Secrets', desc: 'Passwords, private keys, confidential data' },
  { icon: Users, title: 'Inheritance Plans', desc: 'Digital wills with automatic execution' },
];

const stats = [
  { value: 'AES-256', label: 'Encryption Standard' },
  { value: 'L1', label: 'Bitcoin Security' },
  { value: '0', label: 'Data On-Chain' },
  { value: '∞', label: 'Storage Duration' },
];

export default function HomePage() {
  const { isConnected, balance } = useWallet();
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-glow-radial pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 badge badge-orange mb-6 text-sm px-4 py-2">
            <Bitcoin className="w-4 h-4" />
            <span>Built on Bitcoin L1 · Powered by OP_NET</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black text-vault-text mb-6 leading-tight tracking-tight">
            Your Secrets,{' '}
            <span className="text-gradient-orange">Sealed</span> in{' '}
            <br className="hidden md:block" />
            <span className="text-gradient-blue">Bitcoin</span> Forever
          </h1>

          <p className="text-vault-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A Bitcoin-native encrypted data vault. Store your most critical
            secrets with programmable unlock conditions — immutable, trustless, sovereign.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {!isConnected ? (
              <WalletConnect />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-vault-accent-dim border border-vault-accent/20">
                  <Bitcoin className="w-4 h-4 text-vault-accent" />
                  <span className="text-vault-accent text-sm font-medium">
                    {balance < 1000000 ? `${balance.toLocaleString()} sats` : `${(balance / 100000000).toFixed(4)} BTC`}
                  </span>
                </div>
                <Link to="/vault/create" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  <Lock className="w-5 h-5" />
                  Create Your Vault
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link to="/explore" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
              <Globe className="w-5 h-5" />
              Explore Vaults
            </Link>
            <Link to="/dashboard" className="btn-ghost flex items-center gap-2 text-base px-6 py-3">
              <Shield className="w-5 h-5" />
              Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Vault visual */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-16 flex justify-center"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-vault-accent/20 to-vault-secondary/20 border border-vault-accent/30 flex items-center justify-center shadow-vault-glow">
              <Shield className="w-16 h-16 text-vault-accent" />
            </div>
            <div className="absolute -inset-3 rounded-3xl border border-vault-accent/10 animate-pulse-glow" />
            <div className="absolute -inset-6 rounded-3xl border border-vault-accent/5" />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl font-black text-gradient-orange mb-1">
                    {stat.value}
                  </div>
                  <div className="text-vault-muted text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-vault-text mb-4">
              Programmable Vault Security
            </h2>
            <p className="text-vault-muted max-w-xl mx-auto">
              Every vault supports multiple unlock conditions with on-chain enforcement via Bitcoin L1 smart contracts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card glass-card-hover p-6"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-display font-semibold text-vault-text mb-2">{f.title}</h3>
                <p className="text-vault-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 md:p-12 vault-border-glow">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="badge badge-orange mb-4">Use Cases</div>
                <h2 className="font-display text-3xl font-bold text-vault-text mb-4 leading-tight">
                  What You Can Store in Your Vault
                </h2>
                <p className="text-vault-muted leading-relaxed mb-6">
                  From Bitcoin seed phrases to legal wills — CryptexBTC is the secure home for your most important digital assets.
                </p>
                <Link to="/vault/create" className="btn-primary inline-flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Start Storing
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {useCases.map((uc, i) => (
                  <motion.div
                    key={uc.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-vault-accent-dim flex items-center justify-center shrink-0">
                      <uc.icon className="w-4 h-4 text-vault-accent" />
                    </div>
                    <div>
                      <div className="text-vault-text text-sm font-medium">{uc.title}</div>
                      <div className="text-vault-muted text-xs">{uc.desc}</div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-vault-success ml-auto shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-vault-text mb-4">
              How It Works
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Encrypt Locally', desc: 'Your data is encrypted with AES-256 entirely in your browser. Nothing leaves your device unencrypted.' },
              { step: '02', title: 'Anchor on Bitcoin', desc: 'Content hashes and unlock conditions are deployed as OP_NET smart contracts on Bitcoin L1.' },
              { step: '03', title: 'Unlock on Conditions', desc: 'Access is granted via password, time-lock, beneficiary claim, or dead man switch — enforced on-chain.' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center"
              >
                <div className="font-mono text-4xl font-black text-gradient-orange mb-4 opacity-60">{step.step}</div>
                <h3 className="font-display font-semibold text-vault-text mb-2">{step.title}</h3>
                <p className="text-vault-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card vault-border-glow p-10"
          >
            <Star className="w-10 h-10 text-vault-accent mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold text-vault-text mb-4">
              Ready to Seal Your Secrets?
            </h2>
            <p className="text-vault-muted mb-8">
              Create your first Bitcoin vault in minutes. No account required. Fully self-custodial.
            </p>
            <Link to="/vault/create" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              <Shield className="w-5 h-5" />
              Create Free Vault
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
