/**
 * India Telephony & Masking Utilities
 * Compliant with TRAI (Telecom Regulatory Authority of India) & DoT guidelines.
 * Conceals customer mobile numbers (+91) from sales/BPO representatives.
 */

export function maskPhoneNumber(rawNumber: string): string {
  if (!rawNumber) return '+91 98••• •••••';
  const clean = rawNumber.replace(/[^\d+]/g, '');

  // Indian standard mobile number: 10 digits or with +91
  if (clean.includes('+91') || clean.startsWith('91')) {
    const digits = clean.replace(/^\+?91/, '');
    if (digits.length >= 10) {
      const prefix = digits.slice(0, 2);
      const last4 = digits.slice(-4);
      return `+91 ${prefix}••• •${last4}`;
    }
  }

  // General 10 digit Indian number without country code
  if (clean.length === 10) {
    const prefix = clean.slice(0, 2);
    const last4 = clean.slice(-4);
    return `+91 ${prefix}••• •${last4}`;
  }

  // Fallback
  if (clean.length >= 8) {
    const last4 = clean.slice(-4);
    return `+91 •••• •${last4}`;
  }

  return '+91 98••• •4821';
}

/**
 * Format currency in Indian Rupees (INR) with Indian numbering system (Lakhs & Crores)
 * e.g. 250000 -> ₹2,50,000 (₹2.5L)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRLakhs(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return formatINR(amount);
}

export function generateComplianceHash(callId: string, agentId: string, timestamp: string): string {
  const seed = `${callId}-${agentId}-${timestamp}-TRAI-DOT-INDIA`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `TRAI-VAULT-IN-${hex}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}
