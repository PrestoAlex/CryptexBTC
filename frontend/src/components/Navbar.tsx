import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Shield, Home, Plus, Globe, Wallet, Bitcoin,
  Activity, ChevronDown, Zap, LayoutDashboard, Compass, BookOpen
} from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useWallet } from '../hooks/useWallet';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isConnected, balance } = useWallet();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/guide', label: 'Guide', icon: BookOpen },
    { to: '/explore', label: 'Explore', icon: Compass },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div
          className="glass-card flex items-center justify-between px-5 py-3"
          style={{ borderColor: 'rgba(255,140,66,0.15)' }}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 relative z-50 cursor-pointer"
              style={{
                transform: 'scale(4.5) translateY(7%) translateX(30%)',
                transformOrigin: 'center',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-vault-accent-dim text-vault-accent border border-vault-accent/20'
                    : 'text-vault-muted hover:text-vault-text hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vault/create"
              className="hidden md:flex items-center gap-2 btn-primary text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              New Vault
            </Link>

                        
            <div className="hidden md:block">
              <WalletConnect />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <WalletConnect />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-vault-muted hover:text-vault-text hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card mt-2 p-3 flex flex-col gap-1"
            >
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(to)
                      ? 'bg-vault-accent-dim text-vault-accent'
                      : 'text-vault-muted hover:text-vault-text hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <Link
                to="/vault/create"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 btn-primary text-sm py-2.5 px-4 mt-1"
              >
                <Plus className="w-4 h-4" />
                New Vault
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
