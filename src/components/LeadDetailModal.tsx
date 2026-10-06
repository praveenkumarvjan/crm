import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { LeadStatus } from '../types/crm';
import {
  X,
  Phone,
  MessageSquare,
  Shield,
  Clock,
  User,
  Building,
  Tag,
  Plus,
  Send,
  Lock,
  MapPin,
  FileText,
} from 'lucide-react';
import { formatTimeAgo, formatINR } from '../utils/masking';

export const LeadDetailModal: React.FC = () => {
  const {
    selectedLeadForDetail,
    setSelectedLeadForDetail,
    updateLeadStatus,
    addLeadNote,
    startVirtualCall,
    setSelectedLeadForChat,
    callLogs,
  } = useCRM();

  const [newNote, setNewNote] = useState('');

  if (!selectedLeadForDetail) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addLeadNote(selectedLeadForDetail.id, newNote);
    setNewNote('');
  };

  const leadCalls = callLogs.filter((c) => c.leadId === selectedLeadForDetail.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
              {selectedLeadForDetail.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {selectedLeadForDetail.name}
                </h3>
                <span className="text-xs text-slate-400">· {selectedLeadForDetail.company}</span>
                {selectedLeadForDetail.city && (
                  <span className="text-xs text-slate-500">({selectedLeadForDetail.city})</span>
                )}
              </div>

              {/* Number Masking Notice */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masked Number: {selectedLeadForDetail.maskedPhone}</span>
                <span className="text-emerald-400/80 text-[10px]">● TRAI Vault Encrypted</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                startVirtualCall(selectedLeadForDetail);
                setSelectedLeadForDetail(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call via Virtual DID</span>
            </button>

            <button
              onClick={() => {
                setSelectedLeadForChat(selectedLeadForDetail);
                setSelectedLeadForDetail(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Chat</span>
            </button>

            <button
              onClick={() => setSelectedLeadForDetail(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dossier Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Stage:</span>
              <select
                value={selectedLeadForDetail.status}
                onChange={(e) =>
                  updateLeadStatus(selectedLeadForDetail.id, e.target.value as LeadStatus)
                }
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-medium focus:outline-none focus:border-emerald-500 w-full"
              >
                <option value="new_whatsapp">New WhatsApp</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="won">Closed Won</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Deal Value:</span>
              <span className="text-sm font-bold font-mono text-white tabular-nums">
                {formatINR(selectedLeadForDetail.estimatedValue)}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Assigned Rep:</span>
              <span className="text-xs font-medium text-slate-200">
                {selectedLeadForDetail.assignedAgent.name}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">GSTIN / Tax ID:</span>
              <span className="text-xs font-mono text-slate-200">
                {selectedLeadForDetail.gstin || 'GST Unregistered'}
              </span>
            </div>
          </div>

          {/* WhatsApp Initial Query */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Original WhatsApp Inquiry:</span>
            </h4>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed italic">
              "{selectedLeadForDetail.inquirySummary}"
            </div>
          </div>

          {/* Notes & Activity Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Notes & Activity History</h4>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal note, meeting recap, or follow-up note..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Add Note
              </button>
            </form>

            {/* Note items */}
            <div className="space-y-2">
              {selectedLeadForDetail.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-medium text-slate-300">{note.author}</span>
                    <span>{formatTimeAgo(note.timestamp)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call History for this lead */}
          {leadCalls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300">Recorded Calls with Lead:</h4>
              <div className="space-y-2">
                {leadCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{call.status.toUpperCase()}</span>
                        <span className="text-slate-400">· {call.virtualLineName}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{call.notes}</p>
                    </div>

                    <div className="text-right text-slate-400 text-[11px] font-mono">
                      <span className="block text-emerald-400 tabular-nums">
                        {call.recordingDurationFormatted}
                      </span>
                      <span>{formatTimeAgo(call.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
