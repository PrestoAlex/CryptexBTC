# CryptexBTC — Bitcoin L1 Encrypted Data Vault

> Web3 Dropbox for your most critical secrets. Encrypted, immutable, Bitcoin-native.

## Overview

CryptexBTC is a decentralized application that lets users store AES-256 encrypted data with programmable unlock conditions on Bitcoin Layer 1 via [OP_NET](https://opnet.org). Only metadata and content hashes are stored on-chain — plaintext never leaves your device.

---

## Architecture

```
CryptexBTC/
├── contracts/          # OP_NET AssemblyScript smart contracts
│   ├── src/
│   │   ├── datavault/      # DataVault.ts — main vault contract
│   │   ├── vaultfactory/   # VaultFactory.ts — factory + registry
│   │   ├── accessaudit/    # AccessAudit.ts — event audit log
│   │   └── utils.ts        # Shared utilities
│   ├── build/              # Compiled WASM artifacts
│   ├── deploy.ts           # Deployment script
│   └── package.json
│
└── frontend/           # React + Vite + TailwindCSS UI
    ├── src/
    │   ├── components/     # Navbar, VaultCard, ParticleBackground
    │   ├── pages/          # HomePage, Dashboard, CreateVault, VaultDetail, Unlock, Explore
    │   ├── lib/
    │   │   ├── crypto.ts   # AES-256-GCM + PBKDF2 encryption
    │   │   └── storage.ts  # LocalStorage vault persistence
    │   └── types/vault.ts  # TypeScript type definitions
    └── package.json
```

---

## Smart Contracts

### DataVault
Core vault contract storing encrypted metadata and unlock conditions.

| Method | Description |
|--------|-------------|
| `createVault(dataHash, metaHash, unlockType, ...)` | Deploy a new vault |
| `unlock(passwordHash)` | Unlock with password |
| `unlockByTime()` | Unlock when block height reached |
| `unlockByBeneficiary()` | Beneficiary claims the vault |
| `ping()` | Owner keeps dead man switch alive |
| `deadManUnlock()` | Trigger after inactivity period |

### VaultFactory
Registry and factory for deploying DataVault instances.

### AccessAudit
On-chain event log for vault creation, unlocks, and access.

---

## Unlock Conditions

| Type | Description |
|------|-------------|
| **Password** | AES-256 encrypted with PBKDF2-derived key, hash stored on-chain |
| **Time Lock** | Converts date to Bitcoin block height, enforced on-chain |
| **Beneficiary** | Designated address can claim after owner approval |
| **Dead Man Switch** | Auto-releases to beneficiary after inactivity period |

---

## Security Model

- **Client-side only** — AES-256-GCM encryption before any network call
- **PBKDF2 key derivation** — 310,000 iterations with SHA-256
- **Zero plaintext on-chain** — only SHA-256 content hashes stored
- **Immutable anchoring** — Bitcoin L1 provides tamper-proof timestamps
- **Self-custodial** — no server, no account, no custody

---

## Frontend

Built with React 18, Vite, TailwindCSS, Framer Motion, and Lucide icons.

### Pages
- **`/`** — Landing page with feature overview
- **`/dashboard`** — User's vault list with stats and filters
- **`/vault/create`** — 4-step vault creation wizard
- **`/vault/:id`** — Vault detail with info, Dead Man Switch status, actions
- **`/vault/:id/unlock`** — Decryption screen with password input
- **`/explore`** — Public vaults explorer

### Design Palette
| Token | Value |
|-------|-------|
| Background | `#0B0F14` |
| Card | `#151B23` |
| Accent | `#FF8C42` |
| Secondary | `#3BD2FF` |
| Text | `#E9EEF5` |

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Contracts (build)

```bash
cd contracts
npm install
npm run build:all
```

### Contracts (deploy)

```bash
cp .env.example .env
# Fill in MNEMONIC, RPC_URL, WASM_PATH
npm run deploy
```

---

## Environment Variables (contracts/.env)

```
MNEMONIC="your twelve word seed phrase"
RPC_URL=https://testnet.opnet.org
NETWORK=testnet
FEE_RATE=5
PRIORITY_FEE=0
GAS_SAT_FEE=500000
```

---

## Viral Features

1. **Bitcoin Time Capsule** — messages sealed to a future block height
2. **Digital Inheritance** — self-executing wills via beneficiary unlock
3. **Proof of Secret** — cryptographic notarization without revelation
4. **Dead Man Switch** — auto-release after inactivity
5. **Public Mystery Vaults** — explorable sealed vaults on Explore page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | AssemblyScript + OP_NET runtime |
| Blockchain | Bitcoin L1 via OP_NET |
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS + Framer Motion |
| Encryption | Web Crypto API (AES-256-GCM + PBKDF2) |
| Storage | Browser localStorage (MVP) |

---

## Roadmap

### MVP
- [x] Smart contracts (DataVault, VaultFactory, AccessAudit)
- [x] Frontend UI (all 6 pages)
- [x] Client-side AES-256 encryption
- [x] LocalStorage vault persistence
- [ ] OP_NET testnet deployment
- [ ] Wallet connection (OP_NET SDK)

### Production
- [ ] IPFS/Arweave for encrypted payload storage
- [ ] Multi-beneficiary vaults
- [ ] Mobile PWA
- [ ] Vault sharing via encrypted links
- [ ] Premium subscription (larger vaults, advanced conditions)
