import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus } from '../types/crm';
import {
  Search,
  Phone,
  MessageSquare,
  Shield,
  Eye,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { formatTimeAgo, formatINR } from '../utils/masking';

const STATUS_OPTIONS: { id: LeadStatus; label: string }[] = [
  { id: 'new_whatsapp', label: 'New WhatsApp' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'demo_scheduled', label: 'Demo Scheduled' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'won', label: 'Closed Won' },
  { id: 'lost', label: 'Closed Lost' },
];

export const LeadTableView: React.FC = () => {
  const {
    leads,
    updateLeadStatus,
    startVirtualCall,
    setSelectedLeadForChat,
    setSelectedLeadForDetail,
    currentRole,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [copyWarning, setCopyWarning] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.inquirySummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyAttempt = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
    setCopyWarning('TRAI Compliance Notice: Direct customer phone numbers are shielded to prevent lead leakage. Calls must route via Virtual Softphone.');
    setTimeout(() => setCopyWarning(null), 3500);
  };

  const exportLeadsCsv = () => {
    const headers = ['ID', 'Name', 'Company', 'City', 'GSTIN', 'Masked Phone', 'Status', 'Deal Value (INR)', 'Created At'];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.city || ''}"`,
      `"${l.gstin || ''}"`,
      `"${l.maskedPhone}"`,
      l.status,
      l.estimatedValue,
      l.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PulseCRM_Bharat_Leads_Export_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Privacy Warning Banner */}
      {copyWarning && (
        <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{copyWarning}</span>
          </div>
          <button
            onClick={() => setCopyWarning(null)}
            className="text-amber-400 hover:text-amber-200 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, city, company..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Stages ({leads.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={exportLeadsCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Lead / Company</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Masked Contact (+91)</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">WhatsApp Inquiry</th>
                <th className="py-3 px-4 text-right">Value (INR)</th>
                <th className="py-3 px-4">Assigned Rep</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No matching leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Lead / Company */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedLeadForDetail(lead)}
                        className="font-semibold text-white hover:text-emerald-400 transition-colors cursor-pointer text-left block"
                      >
                        {lead.name}
                      </button>
                      <span className="text-[11px] text-slate-400">{lead.company}</span>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      <span>{lead.city || 'India'}</span>
                    </td>

                    {/* Masked Contact (Copy Protected) */}
                    <td className="py-3 px-4" onCopy={handleCopyAttempt}>
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 cursor-not-allowed select-none"
                        title="Customer phone number masked per TRAI privacy guidelines"
                      >
                        <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{lead.maskedPhone}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateLeadStatus(lead.id, e.target.value as LeadStatus)
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Latest WhatsApp Message */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-300 truncate" title={lead.inquirySummary}>
                        "{lead.inquirySummary}"
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {formatTimeAgo(lead.createdAt)}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-emerald-400 tabular-nums">
                      {formatINR(lead.estimatedValue)}
                    </td>

                    {/* Assigned */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-300">
                          {lead.assignedAgent.avatar}
                        </span>
                        <span className="text-xs">{lead.assignedAgent.name}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Call via Virtual Softphone */}
                        <button
                          onClick={() => startVirtualCall(lead)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                          title="Call via Masked Virtual Number Line"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Thread */}
                        <button
                          onClick={() => setSelectedLeadForChat(lead)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Open WhatsApp Chat & Reply"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* Dossier */}
                        <button
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile & Notes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
