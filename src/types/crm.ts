export type LeadStatus =
  | 'new_whatsapp'
  | 'contacted'
  | 'qualified'
  | 'demo_scheduled'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export type LeadSource =
  | 'whatsapp_inbound'
  | 'whatsapp_ad'
  | 'whatsapp_qr'
  | 'whatsapp_referral';

export type Priority = 'high' | 'medium' | 'low';

export type DNDStatus = 'scrubbed_clean' | 'opted_in' | 'dnd_exempt';

export interface WhatsAppMessage {
  id: string;
  sender: 'lead' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface LeadNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  /** Strictly protected: raw Indian mobile number stored in backend compliance vault */
  rawPhone: string;
  /** Masked presentation shown to sales reps: e.g. +91 98••• •4821 */
  maskedPhone: string;
  virtualBridgeId: string;
  company: string;
  city: string;
  gstin?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: Priority;
  dndStatus: DNDStatus;
  assignedAgent: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  inquirySummary: string;
  whatsappThread: WhatsAppMessage[];
  tags: string[];
  /** Amount in Indian Rupees (INR ₹) */
  estimatedValue: number;
  lastContactedAt?: string;
  createdAt: string;
  notes: LeadNote[];
  countryCode: string;
}

export type CallStatus = 'completed' | 'no_answer' | 'busy' | 'voicemail' | 'cancelled';

export interface CallLog {
  id: string;
  leadId: string;
  leadName: string;
  maskedPhone: string;
  virtualLineNumber: string;
  virtualLineName: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  durationSeconds: number;
  status: CallStatus;
  notes: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  audioWaveformPattern: number[];
  recordingDurationFormatted: string;
  complianceHash: string;
  carrierTrunk: string;
}

export interface VirtualLine {
  id: string;
  name: string;
  number: string;
  region: string;
  carrier: 'Exotel India' | 'Ozonetel' | 'Tata TTBS' | 'Airtel IQ' | 'Twilio India';
  status: 'active' | 'busy' | 'standby';
  callsHandledToday: number;
  recordingEncryption: 'AES-256-GCM (TRAI)' | 'TLS-1.3';
  dltTelemarketerId: string;
}

export interface CRMStats {
  totalLeads: number;
  newLeadsToday: number;
  maskedCallsToday: number;
  averageCallDurationSec: number;
  conversionRate: number;
  pipelineValueINR: number;
}

export type UserRole = 'sales_rep' | 'admin_compliance';

export interface LaunchConfig {
  webhookUrl: string;
  verifyToken: string;
  whatsappProvider: 'Meta Cloud API' | 'Gupshup India' | 'Wati' | 'MSG91';
  telephonyProvider: 'Exotel' | 'Ozonetel' | 'Tata TTBS' | 'Airtel IQ';
  dltRegistrationId: string;
  maskingPolicyEnforced: boolean;
  traiDndScrubbingActive: boolean;
  webhookStatus: 'ready' | 'connected' | 'testing';
}
