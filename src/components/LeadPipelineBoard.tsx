import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus, Priority } from '../types/crm';
import {
  Phone,
  MessageSquare,
  Shield,
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  Clock,
  Sparkles,
  TrendingUp,
  PhoneCall,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { formatTimeAgo, formatINR, formatINRLakhs } from '../utils/masking';

const PIPELINE_COLUMNS: { id: LeadStatus; label: string; dotColor: string }[] = [
  { id: 'new_whatsapp', label: 'New WhatsApp Inbound', dotColor: 'bg-emerald-400' },
  { id: 'contacted', label: 'Contacted (Masked Call)', dotColor: 'bg-blue-400' },
  { id: 'qualified', label: 'Qualified', dotColor: 'bg-indigo-400' },
  { id: 'demo_scheduled', label: 'Demo Scheduled', dotColor: 'bg-purple-400' },
  { id: 'proposal_sent', label: 'Proposal Sent', dotColor: 'bg-amber-400' },
  { id: 'won', label: 'Closed Won', dotColor: 'bg-emerald-500' },
  { id: 'lost', label: 'Closed Lost', dotColor: 'bg-rose-500' },
];

export const LeadPipelineBoard: React.FC = () => {
  const {
    leads,
    updateLeadStatus,
    startVirtualCall,
    setSelectedLeadForChat,
    setSelectedLeadForDetail,
    callLogs,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [activeDropdownLeadId, setActiveDropdownLeadId] = useState<string | null>(null);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Calculate Metrics in INR
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.status !== 'lost' ? l.estimatedValue : 0), 0);
  const newLeadsCount = leads.filter((l) => l.status === 'new_whatsapp').length;
  const callsTodayCount = callLogs.length;

  return (
    <div className="space-y-6">
      {/* Metrics Row adhering to single-elevation depth and tabular numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Active Pipeline (INR)</span>
            <span className="font-mono text-emerald-400 font-bold">₹</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {formatINRLakhs(totalPipelineValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {leads.filter((l) => l.status !== 'lost').length} active Indian enterprise deals
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>New WhatsApp Inbound</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {newLeadsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Awaiting initial virtual contact</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Masked Calls Logged Today</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {callsTodayCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">100% number masking enforced (TRAI)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Closed Won Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatINRLakhs(
              leads
                .filter((l) => l.status === 'won')
                .reduce((sum, l) => sum + l.estimatedValue, 0)
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500">Direct WhatsApp conversions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead, city (e.g. Bengaluru, Mumbai), company..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Priority Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs w-full sm:w-auto">
          <span className="text-slate-500 px-2 text-[11px]">Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                priorityFilter === p
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 items-start overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.status === col.id);
          const colValue = colLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

          return (
            <div
              key={col.id}
              className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 min-w-[260px] flex flex-col space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                  <span className="text-xs font-semibold text-slate-200">{col.label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] tabular-nums">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Total Value */}
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                {formatINRLakhs(colValue)} pipeline
              </div>

              {/* Lead Cards List */}
              <div className="space-y-2.5 min-h-[300px]">
                {colLeads.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                    No leads in this stage
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm hover:shadow group relative"
                    >
                      {/* Top Row: Name & Value */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <button
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className="text-xs font-semibold text-white hover:text-emerald-400 transition-colors text-left cursor-pointer"
                          >
                            {lead.name}
                          </button>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>{lead.company}</span>
                            {lead.city && (
                              <>
                                <span>·</span>
                                <span className="text-slate-500">{lead.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                          {formatINRLakhs(lead.estimatedValue)}
                        </span>
                      </div>

                      {/* Number Masking Shield Badge */}
                      <div className="flex items-center justify-between text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800/70">
                        <div className="flex items-center gap-1 text-slate-300 font-mono">
                          <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{lead.maskedPhone}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          TRAI Shielded
                        </span>
                      </div>

                      {/* WhatsApp Inquiry Snippet */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic">
                        "{lead.inquirySummary}"
                      </p>

                      {/* Metadata Row: Assigned & Time */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                        <span>Rep: {lead.assignedAgent.name}</span>
                        <span>{formatTimeAgo(lead.createdAt)}</span>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-1 pt-1.5">
                        {/* Call via Virtual Softphone */}
                        <button
                          onClick={() => startVirtualCall(lead)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Call via Indian Virtual DID Line"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Masked Call</span>
                        </button>

                        {/* Open WhatsApp Thread */}
                        <button
                          onClick={() => setSelectedLeadForChat(lead)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="View WhatsApp Chat conversation & send replies"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* Move Stage Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdownLeadId(
                                activeDropdownLeadId === lead.id ? null : lead.id
                              )
                            }
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Update pipeline status"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeDropdownLeadId === lead.id && (
                            <div className="absolute right-0 top-8 z-30 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 text-xs space-y-0.5">
                              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Move to Stage:
                              </div>
                              {PIPELINE_COLUMNS.map((stage) => (
                                <button
                                  key={stage.id}
                                  onClick={() => {
                                    updateLeadStatus(lead.id, stage.id);
                                    setActiveDropdownLeadId(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center justify-between ${
                                    lead.status === stage.id
                                      ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                                      : 'text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <span>{stage.label}</span>
                                  {lead.status === stage.id && (
                                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
