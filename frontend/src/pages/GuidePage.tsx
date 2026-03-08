import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Shield, Lock, Clock, Users, Zap, Eye, Globe,
  FileText, Key, CheckCircle, Star, ArrowRight, Bitcoin,
  Heart, TrendingUp, Settings, Gem, Rocket
} from 'lucide-react';

export default function GuidePage() {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');

  const content = {
    en: {
      title: "CryptexBTC Guide",
      subtitle: "Learn how to use the most secure data vault on Bitcoin blockchain",
      features: [
        {
          icon: Shield,
          title: 'AES-256 Encryption',
          description: 'All data encrypted client-side before touching the blockchain. Your keys, your secrets.',
          color: 'text-vault-accent',
          bg: 'bg-vault-accent-dim'
        },
        {
          icon: Clock,
          title: 'Time Capsules',
          description: 'Seal messages that unlock at a specific Bitcoin block height. Perfect for future letters.',
          color: 'text-vault-secondary',
          bg: 'bg-vault-secondary-dim'
        },
        {
          icon: Users,
          title: 'Digital Inheritance',
          description: 'Designate beneficiaries who can access your vault if you go inactive.',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10'
        },
        {
          icon: Zap,
          title: 'Dead Man Switch',
          description: 'Automatically release your vault to beneficiaries if you stop confirming activity.',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10'
        },
        {
          icon: Eye,
          title: 'Proof of Secret',
          description: 'Prove a secret existed at a specific time without revealing it. Cryptographic notarization.',
          color: 'text-vault-success',
          bg: 'bg-vault-success/10'
        },
        {
          icon: Globe,
          title: 'Bitcoin Native',
          description: 'Anchored on Bitcoin L1 via OP_NET. Immutable, censorship-resistant, permanent.',
          color: 'text-orange-400',
          bg: 'bg-orange-500/10'
        }
      ],
      useCases: [
        { icon: Key, title: 'Seed Phrase Backup', desc: 'Securely store your crypto recovery phrases' },
        { icon: FileText, title: 'Legal Documents', desc: 'Wills, contracts, power of attorney' },
        { icon: Shield, title: 'Personal Secrets', desc: 'Passwords, private keys, confidential data' },
        { icon: Users, title: 'Inheritance Plans', desc: 'Digital wills with automatic execution' },
        { icon: Heart, title: 'Family Memories', desc: 'Preserve private letters and memories for future generations' },
        { icon: TrendingUp, title: 'Business Plans', desc: 'Protect commercial secrets and strategies' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Connect Wallet',
          description: 'Connect your Bitcoin wallet through OP_NET to access the service.',
          icon: Bitcoin
        },
        {
          step: 2,
          title: 'Create Vault',
          description: 'Choose vault type (Time, DeadMan, Beneficiary, Data) and create it.',
          icon: Lock
        },
        {
          step: 3,
          title: 'Add Data',
          description: 'Upload your data or set unlock conditions.',
          icon: FileText
        },
        {
          step: 4,
          title: 'Configure Settings',
          description: 'Set unlock time, beneficiaries, or other conditions.',
          icon: Settings
        },
        {
          step: 5,
          title: 'Save to Blockchain',
          description: 'Your vault will be immutably saved in Bitcoin blockchain.',
          icon: Shield
        }
      ],
      advantages: [
        {
          icon: Shield,
          title: 'Bank-level Security',
          description: 'AES-256 encryption and Bitcoin blockchain protection'
        },
        {
          icon: Gem,
          title: 'Complete Privacy',
          description: 'No one has access to your data except you'
        },
        {
          icon: Rocket,
          title: 'Low Fees',
          description: 'Efficient OP_NET usage for minimal costs'
        },
        {
          icon: Heart,
          title: 'Decentralized',
          description: 'No central servers or single points of failure'
        }
      ],
      sections: {
        why: 'Why CryptexBTC?',
        useCases: 'Use Cases',
        howToStart: 'How to Get Started?',
        advantages: 'Platform Advantages',
        ready: 'Ready to Secure Your Data?',
        readyDesc: 'Join thousands of users who already trust CryptexBTC with their most valuable data',
        createVault: 'Create Vault',
        explore: 'Explore'
      }
    },
    ua: {
      title: "CryptexBTC Посібник",
      subtitle: "Дізнайтеся, як використовувати найбезпечніше сховище даних на Bitcoin блокчейні",
      features: [
        {
          icon: Shield,
          title: 'AES-256 Шифрування',
          description: 'Всі дані шифруються на стороні клієнта перед тим, як потрапити в блокчейн. Ваші ключі, ваші секрети.',
          color: 'text-vault-accent',
          bg: 'bg-vault-accent-dim'
        },
        {
          icon: Clock,
          title: 'Капсули часу',
          description: 'Запечатайте повідомлення, які розкриваються на певній висоті блоку Bitcoin. Ідеально для майбутніх листів.',
          color: 'text-vault-secondary',
          bg: 'bg-vault-secondary-dim'
        },
        {
          icon: Users,
          title: 'Цифрова спадщина',
          description: 'Призначте бенефіціарів, які можуть отримати доступ до вашого сховища, якщо ви станете неактивними.',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10'
        },
        {
          icon: Zap,
          title: 'Dead Man Switch',
          description: 'Автоматично розкрийте ваше сховище бенефіціарам, якщо ви перестанете підтверджувати активність.',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10'
        },
        {
          icon: Eye,
          title: 'Proof of Secret',
          description: 'Доведіть існування секрету в певний час, не розкриваючи його. Криптографічне нотаріальне завірення.',
          color: 'text-vault-success',
          bg: 'bg-vault-success/10'
        },
        {
          icon: Globe,
          title: 'Bitcoin Native',
          description: 'Заякорений на Bitcoin L1 через OP_NET. Незмінний, стійкий до цензури, постійний.',
          color: 'text-orange-400',
          bg: 'bg-orange-500/10'
        }
      ],
      useCases: [
        { icon: Key, title: 'Резервне копіювання сид-фрази', desc: 'Безпечно зберігайте ваші криптовалютні фрази відновлення' },
        { icon: FileText, title: 'Юридичні документи', desc: 'Заповіти, контракти, довіреності' },
        { icon: Shield, title: 'Особисті секрети', desc: 'Паролі, приватні ключі, конфіденційні дані' },
        { icon: Users, title: 'Плани спадщини', desc: 'Цифрові заповіти з автоматичним виконанням' },
        { icon: Heart, title: 'Сімейні спогади', desc: 'Збережіть приватні листи та спогади для майбутніх поколінь' },
        { icon: TrendingUp, title: 'Бізнес-плани', desc: 'Захистіть комерційну таємницю та стратегії' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Підключіть гаманець',
          description: 'Підключіть ваш Bitcoin гаманець через OP_NET для доступу до сервісу.',
          icon: Bitcoin
        },
        {
          step: 2,
          title: 'Створіть сховище',
          description: 'Виберіть тип сховища (Time, DeadMan, Beneficiary, Data) та створіть його.',
          icon: Lock
        },
        {
          step: 3,
          title: 'Додайте дані',
          description: 'Завантажте ваші дані або встановіть умови розкриття.',
          icon: FileText
        },
        {
          step: 4,
          title: 'Налаштуйте параметри',
          description: 'Встановіть час розкриття, бенефіціарів або інші умови.',
          icon: Settings
        },
        {
          step: 5,
          title: 'Збережіть в блокчейн',
          description: 'Ваше сховище буде незмінно збережено в Bitcoin блокчейні.',
          icon: Shield
        }
      ],
      advantages: [
        {
          icon: Shield,
          title: 'Безпека банківського рівня',
          description: 'AES-256 шифрування та захист Bitcoin блокчейну'
        },
        {
          icon: Gem,
          title: 'Повна приватність',
          description: 'Ніхто не має доступу до ваших даних, окрім вас'
        },
        {
          icon: Rocket,
          title: 'Низькі комісії',
          description: 'Ефективне використання OP_NET для мінімізації витрат'
        },
        {
          icon: Heart,
          title: 'Децентралізований',
          description: 'Немає центральних серверів чи точок відмови'
        }
      ],
      sections: {
        why: 'Чому CryptexBTC?',
        useCases: 'Варіанти використання',
        howToStart: 'Як почати?',
        advantages: 'Переваги платформи',
        ready: 'Готові захистити свої дані?',
        readyDesc: 'Приєднуйтесь до тисяч користувачів, які вже довіряють CryptexBTC своїм найціннішим даним',
        createVault: 'Створити сховище',
        explore: 'Дослідити'
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen pt-20">
      {/* Language Switcher */}
      <div className="fixed top-24 right-4 z-40">
        <div className="glass-card p-2 flex items-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              language === 'en'
                ? 'bg-vault-accent text-white'
                : 'text-vault-muted hover:text-vault-text'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ua')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              language === 'ua'
                ? 'bg-vault-accent text-white'
                : 'text-vault-muted hover:text-vault-text'
            }`}
          >
            UA
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-12 text-center">
        <div className="absolute inset-0 bg-glow-radial pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center gap-2 badge badge-orange mb-6 text-sm px-4 py-2">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'en' ? 'Complete User Guide' : 'Повний посібник користувача'}</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-black text-vault-text mb-6 leading-tight tracking-tight">
              {t.title}
            </h1>

            <p className="text-vault-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-card p-6 mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-vault-text">
              {t.sections.why}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((feature: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-float p-6"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-vault-text text-lg mb-2">{feature.title}</h3>
                <p className="text-vault-muted text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-16 bg-vault-card/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-card p-6 mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-vault-text">
              {t.sections.useCases}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.useCases.map((useCase: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-transform"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-vault-accent-dim flex items-center justify-center flex-shrink-0">
                    <useCase.icon className="w-5 h-5 text-vault-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-vault-text mb-2">{useCase.title}</h3>
                    <p className="text-vault-muted text-sm">{useCase.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Instructions */}
      <section className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-6 mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-vault-text">
              {t.sections.howToStart}
            </h2>
          </div>
          
          <div className="space-y-8">
            {t.instructions.map((instruction: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-vault-accent-dim border-2 border-vault-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-vault-accent font-bold">{instruction.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-vault-text text-lg mb-2">{instruction.title}</h3>
                  <p className="text-vault-muted">{instruction.description}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-vault-secondary-dim flex items-center justify-center">
                  <instruction.icon className="w-5 h-5 text-vault-secondary" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/vault/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              {language === 'en' ? 'Create First Vault' : t.sections.createVault}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Advantages */}
      <section className="px-4 py-16 bg-vault-card/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-card p-6 mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-vault-text">
              {t.sections.advantages}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {t.advantages.map((advantage: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-vault-accent-dim flex items-center justify-center mx-auto mb-6">
                  <advantage.icon className="w-8 h-8 text-vault-accent" />
                </div>
                <h3 className="font-semibold text-vault-text text-xl mb-4">{advantage.title}</h3>
                <p className="text-vault-muted">{advantage.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-12 panel-glow">
            <h2 className="font-display text-3xl font-bold text-vault-text mb-4">
              {t.sections.ready}
            </h2>
            <p className="text-vault-muted text-lg mb-8">
              {t.sections.readyDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/vault/create" className="btn-primary">
                {t.sections.createVault}
              </Link>
              <Link to="/explore" className="btn-secondary">
                {t.sections.explore}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
