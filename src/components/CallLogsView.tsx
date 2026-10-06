import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { CallLog } from '../types/crm';
import {
  Play,
  Pause,
  Shield,
  Lock,
  Download,
  Search,
  CheckCircle2,
  Clock,
  PhoneForwarded,
  Filter,
  FileCheck,
  User,
  Volume2,
} from 'lucide-react';
import { formatTimeAgo, formatDuration } from '../utils/masking';

export const CallLogsView: React.FC = () => {
  const { callLogs, currentRole } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer simulation
  useEffect(() => {
    let timer: number | null = null;
    if (playingCallId) {
      timer = window.setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setPlayingCallId(null);
            return 0;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 200);
    } else {
      setPlaybackProgress(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playingCallId, playbackSpeed]);

  const togglePlay = (callId: string) => {
    if (playingCallId === callId) {
      setPlayingCallId(null);
    } else {
      setPlayingCallId(callId);
      setPlaybackProgress(0);
    }
  };

  const filteredLogs = callLogs.filter((log) => {
    const matchesSearch =
      log.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportAuditLogs = () => {
    const headers = [
      'Call ID',
      'Lead Name',
      'Masked Target',
      'Virtual Line Number',
      'Virtual Line Trunk',
      'Agent',
      'Duration (Sec)',
      'Status',
      'Audit Hash',
      'Timestamp',
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.leadName}"`,
      `"${l.maskedPhone}"`,
      `"${l.virtualLineNumber}"`,
      `"${l.virtualLineName}"`,
      `"${l.agentName}"`,
      l.durationSeconds,
      l.status,
      l.complianceHash,
      l.timestamp,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PulseCRM_Secure_CallAuditLogs_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Compliance Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Encrypted Call Audit & Recording Vault (TRAI / DoT India)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All calls placed via Indian virtual lines (Exotel, Tata TTBS, Airtel IQ) are recorded with
              tamper-proof compliance seals. Raw customer mobile numbers (+91) remain strictly shielded
              from sales representatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Encryption Standard</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              AES-256-GCM / TLS 1.3
            </span>
          </div>
          <button
            onClick={exportAuditLogs}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
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
            placeholder="Search by ID, lead name, agent, or note..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Outcomes ({callLogs.length})</option>
            <option value="completed">Completed / Connected</option>
            <option value="voicemail">Voicemail Left</option>
            <option value="busy">Busy</option>
            <option value="cancelled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No call records found matching criteria
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isPlaying = playingCallId === log.id;

            return (
              <div
                key={log.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 space-y-3 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      {log.id}
                    </span>

                    <div>
                      <span className="text-sm font-semibold text-white">{log.leadName}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        via {log.virtualLineName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {/* Masked destination indicator */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-300"
                      title="Customer number masked from representative"
                    >
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>{log.maskedPhone}</span>
                    </div>

                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-300 tabular-nums">
                      {log.recordingDurationFormatted}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400">{formatTimeAgo(log.timestamp)}</span>
                  </div>
                </div>

                {/* Middle: Notes & Virtual Route Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Rep Notes & Outcome:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{log.notes}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {log.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Route & Compliance Seal */}
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Virtual Number:</span>
                      <span className="font-mono text-slate-200">{log.virtualLineNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Agent:</span>
                      <span className="text-slate-200">{log.agentName}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Outcome Status:</span>
                      <span className="text-emerald-400 font-medium capitalize">
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Vault Hash:</span>
                      <span className="text-emerald-500/80">{log.complianceHash}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Interactive Audio Recording Waveform Player */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(log.id)}
                      className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full transition-colors cursor-pointer shadow-sm"
                      title={isPlaying ? 'Pause playback' : 'Play recorded call audio'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="text-xs">
                      <span className="font-medium text-slate-200 block">
                        Encrypted Call Audio Stream
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isPlaying ? 'Streaming via secure relay' : 'Ready for compliance playback'}
                      </span>
                    </div>
                  </div>

                  {/* Waveform Bar Graphic with Playhead */}
                  <div className="flex-1 w-full flex items-center gap-1 h-8 px-2 bg-slate-900/60 rounded border border-slate-800 relative overflow-hidden">
                    {/* Progress overlay */}
                    {isPlaying && (
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500/10 pointer-events-none transition-all duration-200"
                        style={{ width: `${playbackProgress}%` }}
                      />
                    )}

                    {log.audioWaveformPattern.map((bar, idx) => {
                      const barPercent = (idx / log.audioWaveformPattern.length) * 100;
                      const isPast = isPlaying && playbackProgress >= barPercent;

                      return (
                        <div
                          key={idx}
                          className="flex-1 rounded-full transition-colors duration-150"
                          style={{
                            height: `${Math.max(6, (bar / 100) * 26)}px`,
                            backgroundColor: isPast
                              ? '#34d399'
                              : isPlaying
                              ? '#10b981'
                              : '#334155',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <button
                      onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors cursor-pointer"
                      title="Toggle audio playback speed"
                    >
                      {playbackSpeed}x
                    </button>
                    <span className="text-slate-500 tabular-nums">{log.recordingDurationFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
