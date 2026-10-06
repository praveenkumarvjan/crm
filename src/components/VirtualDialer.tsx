import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Grid,
  Shield,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tag,
  ChevronDown,
  Volume2,
} from 'lucide-react';
import { CallStatus } from '../types/crm';
import { formatDuration } from '../utils/masking';
import { soundEngine } from '../utils/audio';

export const VirtualDialer: React.FC = () => {
  const {
    activeCall,
    toggleMuteCall,
    toggleHoldCall,
    updateCallNotes,
    endVirtualCall,
    virtualLines,
  } = useCRM();

  const [showKeypad, setShowKeypad] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<CallStatus>('completed');
  const [callNotes, setCallNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Virtual Proxy Call']);
  const [cachedLeadInfo, setCachedLeadInfo] = useState<{
    name: string;
    maskedPhone: string;
    company: string;
    duration: number;
    virtualLine: string;
  } | null>(null);

  // When call active updates
  useEffect(() => {
    if (activeCall) {
      setCallNotes(activeCall.notes);
      setCachedLeadInfo({
        name: activeCall.lead.name,
        maskedPhone: activeCall.lead.maskedPhone,
        company: activeCall.lead.company,
        duration: activeCall.durationSeconds,
        virtualLine: activeCall.virtualLine.number,
      });
    }
  }, [activeCall]);

  if (!activeCall && !showOutcomeModal) return null;

  const handleKeyPress = (digit: string) => {
    soundEngine.playDtmfTone(digit);
  };

  const handleHangUp = () => {
    // Open outcome logger modal to finalize details
    if (activeCall) {
      setCachedLeadInfo({
        name: activeCall.lead.name,
        maskedPhone: activeCall.lead.maskedPhone,
        company: activeCall.lead.company,
        duration: activeCall.durationSeconds,
        virtualLine: activeCall.virtualLine.number,
      });
      setShowOutcomeModal(true);
    }
  };

  const handleFinalizeLog = () => {
    endVirtualCall(outcomeStatus, callNotes, selectedTags);
    setShowOutcomeModal(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      {/* Floating Active Softphone Bar / Dock */}
      {activeCall && !showOutcomeModal && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Virtual Softphone Relay
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Masked Line</span>
            </div>
          </div>

          {/* Caller Details & Security Seal */}
          <div className="p-4 space-y-3">
            <div className="text-center space-y-1">
              <h4 className="text-base font-semibold text-white tracking-tight">
                {activeCall.lead.name}
              </h4>
              <p className="text-xs text-slate-400">{activeCall.lead.company}</p>

              {/* Number Masking Banner */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 mt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Target: {activeCall.lead.maskedPhone}</span>
              </div>
            </div>

            {/* Outgoing Line Details */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Outbound Virtual Line:</span>
                <span className="font-mono text-slate-200">{activeCall.virtualLine.number}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Relay Trunk:</span>
                <span className="text-slate-300">{activeCall.virtualLine.name}</span>
              </div>
            </div>

            {/* Status & Live Duration */}
            <div className="text-center py-1">
              {activeCall.state === 'connecting' && (
                <p className="text-xs text-amber-400 font-medium animate-pulse">
                  Negotiating encrypted SIP trunk...
                </p>
              )}
              {activeCall.state === 'ringing' && (
                <p className="text-xs text-blue-400 font-medium animate-pulse">
                  Ringing destination proxy...
                </p>
              )}
              {activeCall.state === 'connected' && (
                <div className="space-y-1">
                  <div className="text-2xl font-mono font-semibold text-white tracking-wider tabular-nums">
                    {formatDuration(activeCall.durationSeconds)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Live Secure Session · TLS 1.3 Audio</span>
                  </div>

                  {/* Audio Waveform Simulation */}
                  <div className="flex items-center justify-center gap-1 h-5 pt-1">
                    {[12, 18, 28, 20, 32, 24, 16, 26, 14, 22].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-emerald-500/80 rounded-full transition-all duration-150"
                        style={{
                          height: activeCall.isHold
                            ? '4px'
                            : `${Math.min(
                                24,
                                height +
                                  (Math.sin(activeCall.durationSeconds * 2 + i) * 8 + 4)
                              )}px`,
                          opacity: activeCall.isMuted ? 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* In-Call Notes Area */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Call Notes (Auto-saved to log):</span>
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => {
                  setCallNotes(e.target.value);
                  updateCallNotes(e.target.value);
                }}
                placeholder="Take notes during conversation (client requirements, agreed next steps)..."
                className="w-full text-xs bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none h-14"
              />
            </div>

            {/* In-Call DTMF Keypad View (collapsible) */}
            {showKeypad && (
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleKeyPress(btn)}
                    className="py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded font-mono text-sm transition-colors cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}

            {/* Controls Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              {/* Mute */}
              <button
                onClick={toggleMuteCall}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  activeCall.isMuted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title={activeCall.isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {activeCall.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Hold */}
              <button
                onClick={toggleHoldCall}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  activeCall.isHold
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title={activeCall.isHold ? 'Resume call' : 'Put on hold'}
              >
                {activeCall.isHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Toggle Keypad */}
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showKeypad
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title="Dialpad (DTMF tones)"
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* End Call / Hang Up */}
              <button
                onClick={handleHangUp}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Outcome Logging Modal */}
      {showOutcomeModal && cachedLeadInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Call Wrap-Up & Secure Log</h3>
                <p className="text-xs text-slate-400">
                  Record call outcome and securely store masked session details
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                <Lock className="w-3 h-3" />
                <span>Masked Audit Active</span>
              </div>
            </div>

            {/* Call Summary Bar */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 block">Lead:</span>
                <span className="font-semibold text-slate-200">{cachedLeadInfo.name}</span>
                <span className="text-slate-500 block">{cachedLeadInfo.company}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Shield:</span>
                <span className="font-mono text-emerald-400 block">{cachedLeadInfo.maskedPhone}</span>
                <span className="text-slate-400 block mt-1">
                  Duration:{' '}
                  <span className="font-mono text-white tabular-nums">
                    {formatDuration(cachedLeadInfo.duration)}
                  </span>
                </span>
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Call Outcome:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'completed', label: 'Connected & Discussed' },
                  { id: 'voicemail', label: 'Left Voicemail' },
                  { id: 'busy', label: 'Line Busy' },
                  { id: 'no_answer', label: 'No Answer' },
                  { id: 'cancelled', label: 'Rescheduled / Call Later' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOutcomeStatus(item.id as CallStatus)}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      outcomeStatus === item.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-medium'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Call Notes & Next Steps:</label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Details of conversation, customer queries, pricing discussed, next meeting date..."
                rows={3}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Quick Tags:</label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  'Virtual Proxy Call',
                  'High Intent',
                  'Demo Scheduled',
                  'Pricing Requested',
                  'Follow-up in 24h',
                  'Decision Maker',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-slate-800 border-slate-600 text-white font-medium'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowOutcomeModal(false);
                  endVirtualCall('cancelled', callNotes, selectedTags);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Skip Detailed Log
              </button>
              <button
                onClick={handleFinalizeLog}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Save & Secure Log Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
