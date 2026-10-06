import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Shield,
  PhoneCall,
  Lock,
  Globe,
  Radio,
  Copy,
  Check,
  RefreshCw,
  Key,
  Server,
  Zap,
} from 'lucide-react';

export const VirtualGatewaysView: React.FC = () => {
  const { virtualLines, currentRole, resetToDefaultData } = useCRM();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Virtual Number Gateway & WhatsApp Sync Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured VoIP lines and webhooks powering bidirectional WhatsApp communication and
              masked calling.
            </p>
          </div>
        </div>

        <button
          onClick={resetToDefaultData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Seed Data</span>
        </button>
      </div>

      {/* Virtual Lines Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Active Outbound Virtual Lines (Relay Trunks)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {virtualLines.map((line) => (
            <div
              key={line.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{line.name}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{line.status}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">
                  Virtual Business Number
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 tracking-wide">
                  {line.number}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>Region (STD Circle):</span>
                  <span className="text-slate-200">{line.region}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carrier Trunk:</span>
                  <span className="text-slate-200">{line.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calls Routed Today:</span>
                  <span className="text-slate-200 font-mono tabular-nums">
                    {line.callsHandledToday}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DLT Registration ID:</span>
                  <span className="font-mono text-slate-200">{line.dltTelemarketerId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Encryption:</span>
                  <span className="font-mono text-emerald-400">{line.recordingEncryption}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Webhook & Security Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: WhatsApp Webhook Config */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">
              WhatsApp Business API Webhook Gateway
            </h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure your Meta Cloud API App webhook callback URL. All inbound WhatsApp messages
            are automatically ingested, parsed into structured lead entities, and assigned to reps.
          </p>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block">Webhook Callback URL:</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value="https://api.pulsecrm.in/v1/webhook/whatsapp"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-300"
                />
                <button
                  onClick={() =>
                    copyToClipboard(
                      'https://api.pulsecrm.in/v1/webhook/whatsapp',
                      'url'
                    )
                  }
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                >
                  {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Verify Token (Secret):</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value="pulse_wa_verify_live_90219"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-300"
                />
                <button
                  onClick={() =>
                    copyToClipboard('pulse_wa_verify_live_90219', 'token')
                  }
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                >
                  {copiedKey === 'token' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-400">
              <span>Automatic Lead Auto-Assignment:</span>
              <span className="text-emerald-400 font-medium">Round-Robin Active</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Sync Latency:</span>
              <span className="font-mono text-slate-200 tabular-nums">&lt; 150ms real-time</span>
            </div>
          </div>
        </div>

        {/* Right: Number Masking & PII Vault Policy */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">
              Zero-PII Phone Number Masking Policy
            </h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your sales reps never see real customer phone numbers. Softphone calls route through our
            dual-hop SIP bridge, ensuring privacy, HIPAA/GDPR compliance, and prevention of lead
            poaching.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-200 block">
                Rep Masking Enforcement: Strict
              </span>
              <p className="text-slate-400 text-[11px]">
                HTML DOM, API responses, and dialpad displays mask phone digits as{' '}
                <span className="font-mono text-emerald-400">+1 (•••) •••-4821</span>. Copying raw
                digits is cryptographically blocked.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-200 block">
                Caller ID Outbound Presentation
              </span>
              <p className="text-slate-400 text-[11px]">
                Customers receive the call with your verified company Virtual Business Line ID,
                never the sales agent's personal phone number.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-200 block">
                Secure Call Recording & Audit
              </span>
              <p className="text-slate-400 text-[11px]">
                Recordings are encrypted at rest with AES-256 and tagged with unique audit hashes for
                compliance validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
