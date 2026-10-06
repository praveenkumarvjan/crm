/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/Navbar';
import { LeadPipelineBoard } from './components/LeadPipelineBoard';
import { LeadTableView } from './components/LeadTableView';
import { CallLogsView } from './components/CallLogsView';
import { VirtualGatewaysView } from './components/VirtualGatewaysView';
import { VirtualDialer } from './components/VirtualDialer';
import { WhatsAppSimulatorModal } from './components/WhatsAppSimulatorModal';
import { WhatsAppChatModal } from './components/WhatsAppChatModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { NotificationToast } from './components/NotificationToast';
import { LaunchCenterModal } from './components/LaunchCenterModal';
import { Shield, MessageSquare, PhoneCall, Lock } from 'lucide-react';

function CRMContent() {
  const [currentTab, setCurrentTab] = useState<'pipeline' | 'table' | 'call_logs' | 'gateways'>(
    'pipeline'
  );
  const [isLaunchCenterOpen, setIsLaunchCenterOpen] = useState(false);
  const { currentRole } = useCRM();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar adhering to 3-zone contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLaunchCenter={() => setIsLaunchCenterOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Role & Protection Sub-header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs font-semibold text-slate-200">
              {currentRole === 'sales_rep'
                ? 'Active Workspace: Sales Representative (Rohan Deshmukh)'
                : 'Active Workspace: Compliance Administrator (Pooja Hegde)'}
            </span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-xs text-slate-400">
              {currentRole === 'sales_rep'
                ? 'Direct +91 customer phone numbers strictly masked'
                : 'TRAI / DoT privacy compliance & audit access granted'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>Virtual Relay Trunk (Exotel / Tata TTBS): ACTIVE</span>
          </div>
        </div>

        {/* Dynamic Tab View */}
        {currentTab === 'pipeline' && <LeadPipelineBoard />}
        {currentTab === 'table' && <LeadTableView />}
        {currentTab === 'call_logs' && <CallLogsView />}
        {currentTab === 'gateways' && <VirtualGatewaysView />}
      </main>

      {/* Floating Elements & Modals */}
      <VirtualDialer />
      <WhatsAppSimulatorModal />
      <WhatsAppChatModal />
      <LeadDetailModal />
      <NotificationToast />
      <LaunchCenterModal
        isOpen={isLaunchCenterOpen}
        onClose={() => setIsLaunchCenterOpen(false)}
      />

      {/* Minimalist Footing */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PulseCRM Bharat · WhatsApp Cloud API Ingest & TRAI Number Masking</span>
          <span className="font-mono text-slate-500">
            Encrypted VoIP SIP Bridge (Bengaluru, Mumbai, Delhi) · AES-256 Vault
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <CRMContent />
    </CRMProvider>
  );
}
