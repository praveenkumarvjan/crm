import React from 'react';
import { useCRM } from '../context/CRMContext';
import {
  MessageSquare,
  PhoneCall,
  CheckCircle,
  Info,
  X,
  Phone,
  ArrowRight,
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const {
    notifications,
    dismissNotification,
    leads,
    setSelectedLeadForDetail,
    startVirtualCall,
  } = useCRM();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-16 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const lead = notif.leadId ? leads.find((l) => l.id === notif.leadId) : null;

        return (
          <div
            key={notif.id}
            className="pointer-events-auto bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-4 duration-200 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {notif.type === 'whatsapp_lead' ? (
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                ) : notif.type === 'call_connected' ? (
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-white tracking-tight">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {notif.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions for WhatsApp Lead notification */}
            {lead && notif.type === 'whatsapp_lead' && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    startVirtualCall(lead);
                    dismissNotification(notif.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call (Masked)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedLeadForDetail(lead);
                    dismissNotification(notif.id);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-md transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
