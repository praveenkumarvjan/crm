import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  X,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  Code2,
  Send,
  Building,
  User,
  Phone,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { Priority } from '../types/crm';
import { formatINR } from '../utils/masking';

const PRESET_INDIAN_SCENARIOS = [
  {
    name: 'Gaurav Singhania',
    company: 'Singhania Real Estate Developers',
    city: 'Bengaluru',
    phone: '+919880014291',
    message: 'Namaste! We receive 500+ buyer inquiries daily from Click-to-WhatsApp ads in Whitefield and Indiranagar. We need 45 agent seats with customer number masking so our brokers cannot take client numbers personal.',
    value: 850000,
    priority: 'high' as Priority,
    tags: ['Real Estate Bengaluru', 'Ad Ingest', 'High Intent'],
  },
  {
    name: 'Kavita Sen',
    company: 'East India Logistics & Cargo Pvt Ltd',
    city: 'Kolkata',
    phone: '+919830078120',
    message: 'Hello, our Kolkata dispatch team needs WhatsApp auto-assignment to 20 reps with virtual Exotel calling. Please arrange a demo today.',
    value: 420000,
    priority: 'high' as Priority,
    tags: ['Logistics Hub', 'Exotel Trunk Req', 'Urgent Lead'],
  },
  {
    name: 'Nikhil Rathi',
    company: 'Rathi FinTech Advisory',
    city: 'Mumbai',
    phone: '+919821099834',
    message: 'Seeking pricing for 30 wealth managers in Nariman Point. Must have TRAI-compliant call recording retention and number masking.',
    value: 650000,
    priority: 'medium' as Priority,
    tags: ['FinTech Mumbai', 'TRAI DLT Ready', 'Compliance'],
  },
];

export const WhatsAppSimulatorModal: React.FC = () => {
  const {
    isWhatsAppSimulatorOpen,
    setIsWhatsAppSimulatorOpen,
    simulateInboundWhatsAppLead,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'json_payload'>('presets');
  const [formData, setFormData] = useState({
    name: 'Praveen Kumar',
    company: 'Praveen Digital Ventures',
    city: 'Chennai',
    rawPhone: '+919840012345',
    message: 'Namaste team, we are launching an all-India sales campaign via WhatsApp. Need immediate setup with virtual DID calling and strict phone number shielding for our reps.',
    estimatedValue: 600000,
    priority: 'high' as Priority,
    tags: 'Pan-India Launch, High Priority, Virtual Softphone',
  });

  if (!isWhatsAppSimulatorOpen) return null;

  const handleSimulatePreset = (preset: typeof PRESET_INDIAN_SCENARIOS[0]) => {
    simulateInboundWhatsAppLead({
      name: preset.name,
      rawPhone: preset.phone,
      company: preset.company,
      message: preset.message,
      priority: preset.priority,
      estimatedValue: preset.value,
      tags: preset.tags,
    });
    setIsWhatsAppSimulatorOpen(false);
  };

  const handleSimulateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    simulateInboundWhatsAppLead({
      name: formData.name,
      rawPhone: formData.rawPhone,
      company: formData.company,
      message: formData.message,
      priority: formData.priority,
      estimatedValue: Number(formData.estimatedValue) || 350000,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setIsWhatsAppSimulatorOpen(false);
  };

  const mockWebhookJson = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WABA_IN_90248201',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+918047190199',
                phone_number_id: 'PHONE_ID_BLR_01',
              },
              contacts: [
                {
                  profile: { name: formData.name },
                  wa_id: formData.rawPhone.replace(/\D/g, ''),
                },
              ],
              messages: [
                {
                  from: formData.rawPhone.replace(/\D/g, ''),
                  id: `wamid.HBgL${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: formData.message },
                  type: 'text',
                },
              ],
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                WhatsApp India Inbound Webhook Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Test real-time lead capture, TRAI compliance check, and auto-sync to database
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppSimulatorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Indian Enterprise Scenarios (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'custom'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Inbound Lead Form
          </button>
          <button
            onClick={() => setActiveTab('json_payload')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'json_payload'
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Meta Cloud API Payload
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Privacy & Masking Assurance Box */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5 text-slate-300">
              <span className="font-semibold text-emerald-300">
                TRAI Customer Number Shielding Enforced:
              </span>
              <p className="text-slate-400">
                Whenever an Indian customer sends a WhatsApp query, the +91 mobile number is encrypted in the compliance vault. Sales reps exclusively see the masked format (e.g.,{' '}
                <span className="font-mono text-emerald-400">+91 98••• •4821</span>).
              </p>
            </div>
          </div>

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Select an Indian inbound scenario to test instant database synchronization:
              </p>
              <div className="space-y-2.5">
                {PRESET_INDIAN_SCENARIOS.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{preset.name}</span>
                        <span className="text-xs text-slate-400">· {preset.company} ({preset.city})</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 tabular-nums font-semibold">
                        {formatINR(preset.value)} est.
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      "{preset.message}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Raw: {preset.phone}</span>
                        <span>→</span>
                        <span className="font-mono text-emerald-400">
                          Masked: +91 {preset.phone.slice(3, 5)}••• •{preset.phone.slice(-4)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSimulatePreset(preset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simulate Webhook Ingest</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleSimulateCustom} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Contact Full Name:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>Company Name:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Customer Mobile Number (+91):</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.rawPhone}
                    onChange={(e) => setFormData({ ...formData, rawPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Indian City / Region:</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Mumbai, Delhi NCR"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <span className="font-mono text-emerald-400 font-bold">₹</span>
                    <span>Deal Estimate (INR):</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedValue: Number(e.target.value) })
                    }
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 tabular-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Priority Level:</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as Priority })
                    }
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>WhatsApp Inbound Message:</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Webhook Ingestion</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'json_payload' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Standard Meta WhatsApp Cloud API India Webhook Payload:</span>
                <span className="font-mono text-[11px] text-emerald-400">POST /v1/webhooks/whatsapp</span>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-64">
                {JSON.stringify(mockWebhookJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
