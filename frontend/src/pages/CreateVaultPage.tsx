import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Key, Clock, Users, Zap, FileText, Heart, Shield,
  Eye, EyeOff, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle
} from 'lucide-react';
import { encryptData, generateContentHash, hashPassword, generateVaultId } from '../lib/crypto';
import { saveVault } from '../lib/storage';
import { useWallet } from '../hooks/useWallet';
import { useCryptexContracts } from '../hooks/useCryptexContracts';
import { CRYPTEXBTC_CONTRACTS } from '../services/contractService';
import type { CreateVaultForm, Vault, VaultType, UnlockType } from '../types/vault';

const VAULT_TYPES: { value: VaultType; label: string; desc: string; icon: typeof Lock; color: string }[] = [
  { value: 'general', label: 'Secret Vault', desc: 'Store any encrypted information securely', icon: FileText, color: 'text-vault-muted' },
  { value: 'inheritance', label: 'Inheritance', desc: 'Digital will with beneficiary access', icon: Heart, color: 'text-rose-400' },
  { value: 'time_capsule', label: 'Time Capsule', desc: 'Sealed until a future date', icon: Clock, color: 'text-vault-secondary' },
  { value: 'dead_man', label: 'Dead Man Switch', desc: 'Auto-releases if you go inactive', icon: Zap, color: 'text-yellow-400' },
  { value: 'proof_of_secret', label: 'Proof of Secret', desc: 'Timestamp a secret without revealing it', icon: Shield, color: 'text-vault-success' },
];

const UNLOCK_TYPES: { value: UnlockType; label: string; desc: string; icon: typeof Lock }[] = [
  { value: 'password', label: 'Password', desc: 'Unlock with a passphrase you set', icon: Key },
  { value: 'time', label: 'Time Lock', desc: 'Unlock after a specific date', icon: Clock },
  { value: 'beneficiary', label: 'Beneficiary', desc: 'A specific address can unlock', icon: Users },
  { value: 'deadman', label: 'Dead Man Switch', desc: 'Unlocks if owner goes inactive', icon: Zap },
];

const STEPS = ['Vault Type', 'Content', 'Unlock', 'Review'];

export default function CreateVaultPage() {
  const navigate = useNavigate();
  const { isConnected, wallet } = useWallet();
  const { createVault } = useCryptexContracts();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateVaultForm>({
    title: '',
    description: '',
    vaultType: 'general',
    unlockType: 'password',
    content: '',
    password: '',
    beneficiaryAddress: '',
    unlockDate: '',
    deadManDays: 365,
    isPublic: false,
    tags: [],
  });

  const update = (key: keyof CreateVaultForm, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const canProceed = () => {
    if (step === 0) return !!form.title;
    if (step === 1) return !!form.content;
    if (step === 2) {
      if (form.unlockType === 'password') return !!form.password && form.password.length >= 8;
      if (form.unlockType === 'time') return !!form.unlockDate;
      if (form.unlockType === 'beneficiary') return !!form.beneficiaryAddress;
      if (form.unlockType === 'deadman') return !!form.beneficiaryAddress && (form.deadManDays ?? 0) > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isConnected || !wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // 1. Encrypt data and generate hashes
      const encrypted = form.password
        ? await encryptData(form.content, form.password)
        : null;

      const { dataHash, metaHash } = await generateContentHash(form.content);
      const pwdHash = form.password ? await hashPassword(form.password) : '';

      // 2. Initialize the existing deployed vault template with on-chain metadata
      let unlockBlockValue = 0;
      if (form.unlockType === 'time') {
        if (!form.unlockDate) {
          throw new Error('Unlock date is required for Time Lock vault');
        }

        const unlockTimestampMs = Date.parse(form.unlockDate);
        if (!Number.isFinite(unlockTimestampMs)) {
          throw new Error('Invalid unlock date format');
        }

        unlockBlockValue = Math.floor(unlockTimestampMs / 600_000);
        if (!Number.isFinite(unlockBlockValue) || unlockBlockValue <= 0) {
          throw new Error('Invalid unlock block value');
        }
      }

      const vaultAddress = form.unlockType === 'time'
        ? CRYPTEXBTC_CONTRACTS.timeVaultTemplate
        : form.unlockType === 'beneficiary'
          ? CRYPTEXBTC_CONTRACTS.beneficiaryVaultTemplate
          : form.unlockType === 'deadman'
            ? CRYPTEXBTC_CONTRACTS.deadManVaultTemplate
            : CRYPTEXBTC_CONTRACTS.dataVaultTemplate;

      await createVault({
        unlockType: form.unlockType,
        dataHash,
        passwordHash: pwdHash || '0',
        unlockBlock: unlockBlockValue,
        beneficiary: form.beneficiaryAddress || wallet.p2tr,
        deadManInterval: form.deadManDays ? form.deadManDays * 144 : 0,
      }, wallet.p2tr);

      // 3. Save metadata locally
      const unlockBlock = form.unlockDate
        ? Math.floor(new Date(form.unlockDate).getTime() / 600_000)
        : 0;

      const vault: Vault = {
        id: generateVaultId(),
        contractAddress: vaultAddress,
        title: form.title,
        description: form.description,
        vaultType: form.vaultType,
        unlockType: form.unlockType,
        dataHash,
        metaHash,
        owner: wallet.p2tr,
        beneficiary: form.beneficiaryAddress || undefined,
        unlockBlock: unlockBlock || undefined,
        deadManInterval: form.deadManDays ? form.deadManDays * 144 : undefined,
        lastPing: Math.floor(Date.now() / 600_000),
        isUnlocked: false,
        isActive: true,
        createdAt: Math.floor(Date.now() / 600_000),
        accessCount: 0,
        isPublic: form.isPublic,
        tags: form.tags,
        proofTimestamp: Math.floor(Date.now() / 600_000),
        encryptedData: encrypted ? JSON.stringify(encrypted) : undefined,
      };

      saveVault(vault);
      navigate(`/vault/${vault.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create vault. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getUnlockTypeValue = (type: UnlockType): number => {
    switch (type) {
      case 'password': return 0;
      case 'time': return 1;
      case 'beneficiary': return 2;
      case 'deadman': return 3;
      default: return 0;
    }
  };

  const getVaultTypeValue = (type: VaultType): number => {
    switch (type) {
      case 'general': return 0;
      case 'inheritance': return 1;
      case 'time_capsule': return 2;
      case 'dead_man': return 3;
      case 'proof_of_secret': return 4;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-vault-text mb-2">Create New Vault</h1>
          <p className="text-vault-muted text-sm">Secure your secrets on Bitcoin L1</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i < step ? 'bg-vault-success text-white' :
                i === step ? 'bg-vault-accent text-white' :
                'bg-white/10 text-vault-muted'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-vault-text' : 'text-vault-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-vault-success/50' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-6 md:p-8"
        >
          {/* Step 0: Vault Type */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-vault-text text-sm font-medium mb-2">Vault Title *</label>
                <input
                  className="input-vault"
                  placeholder="e.g. My Bitcoin Seed Phrase"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-vault-text text-sm font-medium mb-2">Description</label>
                <input
                  className="input-vault"
                  placeholder="Brief description (optional)"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-vault-text text-sm font-medium mb-3">Vault Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {VAULT_TYPES.map(vt => (
                    <button
                      key={vt.value}
                      onClick={() => update('vaultType', vt.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        form.vaultType === vt.value
                          ? 'border-vault-accent bg-vault-accent-dim'
                          : 'border-white/8 bg-white/3 hover:border-white/15'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        form.vaultType === vt.value ? 'bg-vault-accent/20' : 'bg-white/5'
                      }`}>
                        <vt.icon className={`w-4 h-4 ${form.vaultType === vt.value ? 'text-vault-accent' : vt.color}`} />
                      </div>
                      <div>
                        <div className="text-vault-text text-sm font-medium">{vt.label}</div>
                        <div className="text-vault-muted text-xs">{vt.desc}</div>
                      </div>
                      {form.vaultType === vt.value && <CheckCircle className="w-4 h-4 text-vault-accent ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <input
                  type="checkbox"
                  id="public"
                  checked={form.isPublic}
                  onChange={e => update('isPublic', e.target.checked)}
                  className="w-4 h-4 accent-vault-accent"
                />
                <label htmlFor="public" className="text-vault-text text-sm cursor-pointer">
                  Make this a public vault (visible on Explore page)
                </label>
              </div>
            </div>
          )}

          {/* Step 1: Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-vault-text text-sm font-medium mb-2">Secret Content *</label>
                <p className="text-vault-muted text-xs mb-3">
                  This will be encrypted AES-256 client-side. Never transmitted unencrypted.
                </p>
                <textarea
                  className="input-vault h-48 resize-none font-mono text-sm"
                  placeholder="Enter your secret content here...&#10;&#10;Examples:&#10;- Seed phrases&#10;- Private keys&#10;- Passwords&#10;- Personal messages&#10;- Legal instructions"
                  value={form.content}
                  onChange={e => update('content', e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-vault-muted text-xs">All data encrypted before leaving your device</span>
                  <span className="text-vault-muted text-xs">{form.content.length} chars</span>
                </div>
              </div>
              <div className="glass-card p-4 border border-vault-accent/20">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-vault-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="text-vault-accent text-xs font-semibold mb-1">Client-Side Encryption</div>
                    <div className="text-vault-muted text-xs">
                      AES-256-GCM with PBKDF2 key derivation (310,000 iterations). Only the encrypted hash is stored on-chain.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Unlock conditions */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-vault-text text-sm font-medium mb-3">Unlock Method</label>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {UNLOCK_TYPES.map(ut => (
                    <button
                      key={ut.value}
                      onClick={() => update('unlockType', ut.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        form.unlockType === ut.value
                          ? 'border-vault-accent bg-vault-accent-dim'
                          : 'border-white/8 bg-white/3 hover:border-white/15'
                      }`}
                    >
                      <ut.icon className={`w-5 h-5 ${form.unlockType === ut.value ? 'text-vault-accent' : 'text-vault-muted'}`} />
                      <span className="text-xs font-medium text-vault-text">{ut.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {form.unlockType === 'password' && (
                  <motion.div key="pwd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label className="block text-vault-text text-sm font-medium mb-2">Vault Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-vault pr-10"
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-vault-muted text-xs mt-1">Store this password safely — it cannot be recovered.</p>
                  </motion.div>
                )}

                {form.unlockType === 'time' && (
                  <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label className="block text-vault-text text-sm font-medium mb-2">Unlock Date *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="input-vault"
                        placeholder="DD.MM.YYYY"
                        onChange={e => {
                          let value = e.target.value;
                          // Дозволяємо тільки цифри і крапки
                          value = value.replace(/[^\d.]/g, '');
                          
                          // Автоматичне форматування DD.MM.YYYY
                          if (value.length === 2 && !value.includes('.')) {
                            value = value + '.'; // Додаємо крапку після дня
                          } else if (value.length === 5 && value.match(/^\d{2}\.\d{2}$/)) {
                            value = value + '.'; // Додаємо крапку після місяця
                          }
                          
                          // Обмежуємо формат DD.MM.YYYY
                          const parts = value.split('.');
                          if (parts[0] && parts[0].length > 2) parts[0] = parts[0].slice(0, 2); // День - max 2 цифри
                          if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2); // Місяць - max 2 цифри
                          if (parts[2] && parts[2].length > 4) parts[2] = parts[2].slice(0, 4); // Рік - max 4 цифри
                          
                          const finalValue = parts.join('.');
                          e.target.value = finalValue;
                          
                          // Зберігаємо дату якщо формат повний
                          if (finalValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                            const [day, month, year] = finalValue.split('.');
                            const date = new Date(`${year}-${month}-${day}T12:00:00`);
                            if (!isNaN(date.getTime())) {
                              update('unlockDate', date.toISOString().slice(0, 16));
                            }
                          }
                        }}
                        maxLength={10}
                      />
                      <input
                        type="text"
                        className="input-vault"
                        placeholder="HH:MM"
                        onChange={e => {
                          let value = e.target.value;
                          // Дозволяємо тільки цифри і двокрапку
                          value = value.replace(/[^\d:]/g, '');
                          
                          // Автоматичне форматування HH:MM
                          if (value.length === 2 && !value.includes(':')) {
                            value = value + ':'; // Додаємо двокрапку після годин
                          }
                          
                          // Обмежуємо формат HH:MM
                          const parts = value.split(':');
                          if (parts[0] && parts[0].length > 2) parts[0] = parts[0].slice(0, 2); // Години - max 2 цифри
                          if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2); // Хвилини - max 2 цифри
                          
                          const finalValue = parts.join(':');
                          e.target.value = finalValue;
                          
                          // Зберігаємо час якщо формат повний і є дата
                          if (finalValue.match(/^\d{2}:\d{2}$/) && form.unlockDate) {
                            const [hours, minutes] = finalValue.split(':');
                            const date = new Date(form.unlockDate);
                            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            update('unlockDate', date.toISOString().slice(0, 16));
                          }
                        }}
                        maxLength={5}
                      />
                    </div>
                    <p className="text-vault-muted text-xs mt-1">Format: DD.MM.YYYY HH:MM (English). Year limited to 4 digits. Converted to Bitcoin block height on-chain.</p>
                  </motion.div>
                )}

                {(form.unlockType === 'beneficiary' || form.unlockType === 'deadman') && (
                  <motion.div key="bene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-vault-text text-sm font-medium mb-2">Beneficiary Address *</label>
                      <input
                        className="input-vault font-mono text-sm"
                        placeholder="bc1p..."
                        value={form.beneficiaryAddress}
                        onChange={e => update('beneficiaryAddress', e.target.value)}
                      />
                    </div>
                    {form.unlockType === 'deadman' && (
                      <div>
                        <label className="block text-vault-text text-sm font-medium mb-2">
                          Inactivity Period: {form.deadManDays} days
                        </label>
                        <input
                          type="range"
                          min={30}
                          max={3650}
                          step={30}
                          value={form.deadManDays}
                          onChange={e => update('deadManDays', parseInt(e.target.value))}
                          className="w-full accent-vault-accent"
                        />
                        <div className="flex justify-between text-xs text-vault-muted mt-1">
                          <span>30 days</span><span>10 years</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-vault-text mb-4">Review Your Vault</h3>
              {[
                { label: 'Title', value: form.title },
                { label: 'Type', value: VAULT_TYPES.find(v => v.value === form.vaultType)?.label },
                { label: 'Unlock', value: UNLOCK_TYPES.find(u => u.value === form.unlockType)?.label },
                { label: 'Content', value: `${form.content.length} characters (will be encrypted)` },
                form.beneficiaryAddress ? { label: 'Beneficiary', value: form.beneficiaryAddress } : null,
                form.unlockDate ? { label: 'Unlock Date', value: new Date(form.unlockDate).toLocaleDateString() } : null,
                form.deadManDays ? { label: 'Dead Man Period', value: `${form.deadManDays} days` } : null,
              ].filter(Boolean).map(item => item && (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-vault-muted text-sm">{item.label}</span>
                  <span className="text-vault-text text-sm font-medium max-w-xs truncate text-right">{item.value}</span>
                </div>
              ))}

              <div className="mt-4 p-4 rounded-xl bg-vault-accent-dim border border-vault-accent/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-vault-accent mt-0.5 shrink-0" />
                  <p className="text-vault-accent text-xs">
                    Your content will be encrypted AES-256 and the hash anchored on Bitcoin L1. This is permanent and immutable.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-vault-danger/10 border border-vault-danger/30 text-vault-danger text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}
            className="btn-ghost flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sealing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Seal Vault
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
