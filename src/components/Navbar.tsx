import React from 'react';
import { useCRM } from '../context/CRMContext';
import { PhoneCall, MessageSquare, ShieldCheck, Volume2, VolumeX, Rocket } from 'lucide-react';

interface NavbarProps {
  currentTab: 'pipeline' | 'table' | 'call_logs' | 'gateways';
  setCurrentTab: (tab: 'pipeline' | 'table' | 'call_logs' | 'gateways') => void;
  onOpenLaunchCenter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenLaunchCenter }) => {
  const {
    currentRole,
    setCurrentRole,
    soundEnabled,
    setSoundEnabled,
    setIsWhatsAppSimulatorOpen,
  } = useCRM();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentTab('pipeline')}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          PulseCRM Bharat
        </button>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('pipeline')}
            className={`transition-colors pb-0.5 border-b-2 text-left cursor-pointer ${
              currentTab === 'pipeline'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipeline
          </button>

          <button
            onClick={() => setCurrentTab('table')}
            className={`transition-colors pb-0.5 border-b-2 text-left cursor-pointer ${
              currentTab === 'table'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Leads
          </button>

          <button
            onClick={() => setCurrentTab('call_logs')}
            className={`transition-colors pb-0.5 border-b-2 text-left cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'call_logs'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Call Audit Logs</span>
          </button>

          <button
            onClick={() => setCurrentTab('gateways')}
            className={`transition-colors pb-0.5 border-b-2 text-left cursor-pointer ${
              currentTab === 'gateways'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Virtual Gateways
          </button>
        </nav>

        {/* Zone 3: Primary actions & Controls */}
        <div className="flex items-center gap-3">
          {/* Sound toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Indian ringback audio' : 'Enable Indian ringback audio'}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Role switcher (Sales Rep vs Compliance Admin) */}
          <div className="relative inline-flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setCurrentRole('sales_rep')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                currentRole === 'sales_rep'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sales Rep view: +91 phone numbers strictly masked"
            >
              Sales Rep
            </button>
            <button
              onClick={() => setCurrentRole('admin_compliance')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                currentRole === 'admin_compliance'
                  ? 'bg-emerald-950/80 text-emerald-300 font-medium border border-emerald-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compliance Admin: Access TRAI audit trails & virtual gateway keys"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin</span>
            </button>
          </div>

          {/* Launch Control Center Button */}
          <button
            onClick={onOpenLaunchCenter}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Launch in India: Webhook & Telephony Setup"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Control</span>
          </button>

          {/* Primary Action: Simulate Inbound WhatsApp Lead */}
          <button
            onClick={() => setIsWhatsAppSimulatorOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/10 cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Simulate WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
};
