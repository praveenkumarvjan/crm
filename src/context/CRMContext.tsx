import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Lead, CallLog, VirtualLine, LeadStatus, Priority, UserRole, CallStatus, WhatsAppMessage } from '../types/crm';
import { INITIAL_LEADS, INITIAL_CALL_LOGS, INITIAL_VIRTUAL_LINES } from '../data/initialData';
import { maskPhoneNumber, generateComplianceHash } from '../utils/masking';
import { soundEngine } from '../utils/audio';

export interface ToastNotification {
  id: string;
  type: 'whatsapp_lead' | 'call_connected' | 'call_completed' | 'status_updated' | 'info';
  title: string;
  message: string;
  timestamp: string;
  leadId?: string;
}

export interface ActiveCallState {
  lead: Lead;
  virtualLine: VirtualLine;
  startTime: number;
  state: 'connecting' | 'ringing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isHold: boolean;
  notes: string;
}

interface CRMContextType {
  leads: Lead[];
  callLogs: CallLog[];
  virtualLines: VirtualLine[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCall: ActiveCallState | null;
  notifications: ToastNotification[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedLeadForDetail: Lead | null;
  setSelectedLeadForDetail: (lead: Lead | null) => void;
  selectedLeadForChat: Lead | null;
  setSelectedLeadForChat: (lead: Lead | null) => void;
  isWhatsAppSimulatorOpen: boolean;
  setIsWhatsAppSimulatorOpen: (open: boolean) => void;
  isVirtualSettingsOpen: boolean;
  setIsVirtualSettingsOpen: (open: boolean) => void;
  
  // Actions
  updateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  addLeadNote: (leadId: string, noteText: string) => void;
  sendWhatsAppReply: (leadId: string, messageText: string) => void;
  startVirtualCall: (lead: Lead, virtualLineId?: string) => void;
  toggleMuteCall: () => void;
  toggleHoldCall: () => void;
  updateCallNotes: (notes: string) => void;
  endVirtualCall: (outcomeStatus?: CallStatus, finalNotes?: string, tags?: string[]) => void;
  simulateInboundWhatsAppLead: (payload: {
    name: string;
    rawPhone: string;
    company: string;
    message: string;
    priority?: Priority;
    estimatedValue?: number;
    tags?: string[];
  }) => void;
  dismissNotification: (id: string) => void;
  resetToDefaultData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const LEADS_STORAGE_KEY = 'pulsecrm_leads_v1';
const CALLS_STORAGE_KEY = 'pulsecrm_call_logs_v1';
const LINES_STORAGE_KEY = 'pulsecrm_virtual_lines_v1';

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_LEADS;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const stored = localStorage.getItem(CALLS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_CALL_LOGS;
  });

  const [virtualLines, setVirtualLines] = useState<VirtualLine[]>(() => {
    try {
      const stored = localStorage.getItem(LINES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_VIRTUAL_LINES;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('sales_rep');
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [selectedLeadForChat, setSelectedLeadForChat] = useState<Lead | null>(null);
  const [isWhatsAppSimulatorOpen, setIsWhatsAppSimulatorOpen] = useState(false);
  const [isVirtualSettingsOpen, setIsVirtualSettingsOpen] = useState(false);

  const callTimerRef = useRef<number | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(callLogs));
    } catch {
      // ignore
    }
  }, [callLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(virtualLines));
    } catch {
      // ignore
    }
  }, [virtualLines]);

  // Keep selectedLeadForDetail updated if underlying lead changes
  useEffect(() => {
    if (selectedLeadForDetail) {
      const updated = leads.find((l) => l.id === selectedLeadForDetail.id);
      if (updated) setSelectedLeadForDetail(updated);
    }
  }, [leads]);

  // Handle call timer when active call is connected
  useEffect(() => {
    if (activeCall && activeCall.state === 'connected') {
      callTimerRef.current = window.setInterval(() => {
        setActiveCall((prev) => {
          if (!prev || prev.state !== 'connected') return prev;
          return {
            ...prev,
            durationSeconds: prev.durationSeconds + 1,
          };
        });
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [activeCall?.state]);

  const addNotification = (notif: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newNotif: ToastNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated: Lead = {
            ...l,
            status: newStatus,
            lastContactedAt: new Date().toISOString(),
          };
          return updated;
        }
        return l;
      })
    );

    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      addNotification({
        type: 'status_updated',
        title: 'Lead Status Updated',
        message: `${lead.name} moved to "${newStatus.replace('_', ' ').toUpperCase()}"`,
        leadId,
      });
    }
  };

  const addLeadNote = (leadId: string, noteText: string) => {
    if (!noteText.trim()) return;
    const authorName = currentRole === 'sales_rep' ? 'Rohan Deshmukh' : 'Pooja Hegde (Admin)';
    const newNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      text: noteText.trim(),
      timestamp: new Date().toISOString(),
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            notes: [newNote, ...l.notes],
          };
        }
        return l;
      })
    );
  };

  const sendWhatsAppReply = (leadId: string, messageText: string) => {
    if (!messageText.trim()) return;
    const authorName = currentRole === 'sales_rep' ? 'Rohan Deshmukh' : 'Pooja Hegde (Compliance Admin)';
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      senderName: authorName,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            whatsappThread: [...l.whatsappThread, newMsg],
            status: l.status === 'new_whatsapp' ? 'contacted' : l.status,
            lastContactedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );

    // Simulate WhatsApp delivery status update after 1.2s
    setTimeout(() => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === leadId) {
            return {
              ...l,
              whatsappThread: l.whatsappThread.map((m) =>
                m.id === newMsg.id ? { ...m, status: 'delivered' } : m
              ),
            };
          }
          return l;
        })
      );
    }, 1200);
  };

  const startVirtualCall = (lead: Lead, virtualLineId?: string) => {
    // If call already active, end it first
    if (activeCall) {
      endVirtualCall('cancelled');
    }

    const line =
      virtualLines.find((vl) => vl.id === (virtualLineId || lead.virtualBridgeId)) ||
      virtualLines[0];

    const callState: ActiveCallState = {
      lead,
      virtualLine: line,
      startTime: Date.now(),
      state: 'connecting',
      durationSeconds: 0,
      isMuted: false,
      isHold: false,
      notes: '',
    };

    setActiveCall(callState);

    // Step 1: Connecting (SIP trunk negotiation) -> Ringing after 800ms
    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, state: 'ringing' } : null));
      if (soundEnabled) {
        soundEngine.startRingback();
      }

      // Step 2: Auto-connect simulate after 2.8s ringing
      ringTimeoutRef.current = window.setTimeout(() => {
        if (soundEnabled) {
          soundEngine.playCallConnected();
        }
        setActiveCall((prev) => (prev ? { ...prev, state: 'connected' } : null));
        addNotification({
          type: 'call_connected',
          title: 'Virtual Bridge Established',
          message: `Connected to ${lead.name} via ${line.name}. Raw number shielded.`,
          leadId: lead.id,
        });
      }, 2800);
    }, 800);
  };

  const toggleMuteCall = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  };

  const toggleHoldCall = () => {
    setActiveCall((prev) => (prev ? { ...prev, isHold: !prev.isHold } : null));
  };

  const updateCallNotes = (notes: string) => {
    setActiveCall((prev) => (prev ? { ...prev, notes } : null));
  };

  const endVirtualCall = (outcomeStatus: CallStatus = 'completed', finalNotes?: string, tags?: string[]) => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    soundEngine.stopRingback();

    if (!activeCall) return;

    if (soundEnabled) {
      soundEngine.playCallEnded();
    }

    const duration = activeCall.durationSeconds;
    const notesText = finalNotes || activeCall.notes || 'Routine consultation call via virtual masked bridge.';
    const callId = `CALL-SEC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    const agentName = currentRole === 'sales_rep' ? 'Alex Morgan' : 'Sarah Jenkins';
    const agentId = currentRole === 'sales_rep' ? 'agent-1' : 'agent-2';

    // Generate simulated waveform pattern
    const waveform = Array.from({ length: 18 }, () => Math.floor(20 + Math.random() * 75));

    const newLog: CallLog = {
      id: callId,
      leadId: activeCall.lead.id,
      leadName: activeCall.lead.name,
      maskedPhone: activeCall.lead.maskedPhone,
      virtualLineNumber: activeCall.virtualLine.number,
      virtualLineName: activeCall.virtualLine.name,
      carrierTrunk: activeCall.virtualLine.carrier,
      agentId,
      agentName: currentRole === 'sales_rep' ? 'Rohan Deshmukh' : 'Pooja Hegde',
      timestamp,
      durationSeconds: Math.max(duration, 5),
      status: outcomeStatus,
      notes: notesText,
      tags: tags && tags.length > 0 ? tags : ['Virtual Proxy Call', 'TRAI Masked Session'],
      sentiment: duration > 60 ? 'positive' : 'neutral',
      audioWaveformPattern: waveform,
      recordingDurationFormatted: `${Math.floor(Math.max(duration, 5) / 60)
        .toString()
        .padStart(2, '0')}:${(Math.max(duration, 5) % 60).toString().padStart(2, '0')}`,
      complianceHash: generateComplianceHash(callId, agentId, timestamp),
    };

    setCallLogs((prev) => [newLog, ...prev]);

    // Update lead lastContactedAt and status if currently 'new_whatsapp'
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === activeCall.lead.id) {
          const newStatus = l.status === 'new_whatsapp' ? 'contacted' : l.status;
          return {
            ...l,
            status: newStatus,
            lastContactedAt: timestamp,
            notes: [
              {
                id: `note-${Date.now()}`,
                author: `${agentName} (Virtual Softphone)`,
                text: `Masked call logged (${newLog.recordingDurationFormatted}) - ${outcomeStatus.toUpperCase()}: ${notesText}`,
                timestamp,
              },
              ...l.notes,
            ],
          };
        }
        return l;
      })
    );

    // Update Virtual line calls count
    setVirtualLines((prev) =>
      prev.map((vl) =>
        vl.id === activeCall.virtualLine.id
          ? { ...vl, callsHandledToday: vl.callsHandledToday + 1 }
          : vl
      )
    );

    addNotification({
      type: 'call_completed',
      title: 'Call Logged Securely',
      message: `Recording & audit hash saved for ${activeCall.lead.name} (${newLog.recordingDurationFormatted})`,
      leadId: activeCall.lead.id,
    });

    setActiveCall(null);
  };

  const simulateInboundWhatsAppLead = (payload: {
    name: string;
    rawPhone: string;
    company: string;
    city?: string;
    message: string;
    priority?: Priority;
    estimatedValue?: number;
    tags?: string[];
  }) => {
    const leadId = `lead-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const maskedPhone = maskPhoneNumber(payload.rawPhone);

    const newLead: Lead = {
      id: leadId,
      name: payload.name,
      rawPhone: payload.rawPhone,
      maskedPhone,
      virtualBridgeId: virtualLines[0].id,
      company: payload.company || 'Enterprise Prospect',
      city: payload.city || 'Bengaluru',
      source: 'whatsapp_inbound',
      status: 'new_whatsapp',
      priority: payload.priority || 'high',
      dndStatus: 'scrubbed_clean',
      assignedAgent: {
        id: 'agent-1',
        name: 'Rohan Deshmukh',
        role: 'Senior Enterprise AE',
        avatar: 'RD',
      },
      inquirySummary: payload.message,
      whatsappThread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'lead',
          senderName: payload.name,
          text: payload.message,
          timestamp,
          status: 'delivered',
        },
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'system',
          senderName: 'PulseBot Bharat (Automation)',
          text: 'Namaste! Thank you for contacting us via WhatsApp Business India. Your request has been securely assigned to our enterprise team.',
          timestamp,
          status: 'sent',
        },
      ],
      tags: payload.tags || ['WhatsApp Inbound', 'TRAI Verified Webhook'],
      estimatedValue: payload.estimatedValue || 350000,
      createdAt: timestamp,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'System Webhook Ingestion',
          text: `Inbound WhatsApp webhook received from encrypted payload. Customer mobile number shielded in compliance vault, presented to agent as ${maskedPhone}.`,
          timestamp,
        },
      ],
      countryCode: 'IN',
    };

    setLeads((prev) => [newLead, ...prev]);

    if (soundEnabled) {
      soundEngine.playWhatsAppChime();
    }

    addNotification({
      type: 'whatsapp_lead',
      title: 'New WhatsApp Lead Captured!',
      message: `${newLead.name} (${newLead.company}) sent an inbound message. Auto-assigned to sales pipeline.`,
      leadId,
    });
  };

  const resetToDefaultData = () => {
    setLeads(INITIAL_LEADS);
    setCallLogs(INITIAL_CALL_LOGS);
    setVirtualLines(INITIAL_VIRTUAL_LINES);
    localStorage.removeItem(LEADS_STORAGE_KEY);
    localStorage.removeItem(CALLS_STORAGE_KEY);
    localStorage.removeItem(LINES_STORAGE_KEY);
    addNotification({
      type: 'info',
      title: 'Database Reset',
      message: 'Demo leads and secure call logs restored to baseline.',
    });
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        callLogs,
        virtualLines,
        currentRole,
        setCurrentRole,
        activeCall,
        notifications,
        soundEnabled,
        setSoundEnabled,
        selectedLeadForDetail,
        setSelectedLeadForDetail,
        selectedLeadForChat,
        setSelectedLeadForChat,
        isWhatsAppSimulatorOpen,
        setIsWhatsAppSimulatorOpen,
        isVirtualSettingsOpen,
        setIsVirtualSettingsOpen,
        updateLeadStatus,
        addLeadNote,
        sendWhatsAppReply,
        startVirtualCall,
        toggleMuteCall,
        toggleHoldCall,
        updateCallNotes,
        endVirtualCall,
        simulateInboundWhatsAppLead,
        dismissNotification,
        resetToDefaultData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
