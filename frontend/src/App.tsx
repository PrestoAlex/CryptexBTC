import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import BackgroundMusic from './components/BackgroundMusic';
import GoldenRain from './components/GoldenRain';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import GuidePage from './pages/GuidePage';
import CreateVaultPage from './pages/CreateVaultPage';
import VaultDetailPage from './pages/VaultDetailPage';
import UnlockPage from './pages/UnlockPage';
import ExploreVaultsPage from './pages/ExploreVaultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <ParticleBackground />
        <GoldenRain />
        <Navbar />
        <BackgroundMusic />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/vault/create" element={<CreateVaultPage />} />
            <Route path="/vault/:id" element={<VaultDetailPage />} />
            <Route path="/vault/:id/unlock" element={<UnlockPage />} />
            <Route path="/explore" element={<ExploreVaultsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
