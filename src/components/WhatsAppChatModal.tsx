import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  X,
  Send,
  Phone,
  Shield,
  Check,
  CheckCheck,
  Sparkles,
  Paperclip,
  Smile,
  Lock,
} from 'lucide-react';
import { formatTimeAgo } from '../utils/masking';

export const WhatsAppChatModal: React.FC = () => {
  const {
    selectedLeadForChat,
    setSelectedLeadForChat,
    sendWhatsAppReply,
    startVirtualCall,
  } = useCRM();

  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedLeadForChat) {
      scrollToBottom();
    }
  }, [selectedLeadForChat?.whatsappThread]);

  if (!selectedLeadForChat) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendWhatsAppReply(selectedLeadForChat.id, replyText);
    setReplyText('');
  };

  const handleUseTemplate = (template: string) => {
    const text = template.replace('{name}', selectedLeadForChat.name.split(' ')[0]);
    setReplyText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center justify-center text-xs border border-emerald-500/30">
              {selectedLeadForChat.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {selectedLeadForChat.name}
                </h3>
                <span className="text-xs text-slate-400">· {selectedLeadForChat.company}</span>
              </div>

              {/* Masked Phone Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Masked: {selectedLeadForChat.maskedPhone}</span>
                <span className="text-emerald-500/80 text-[10px]">● Verified Indian Session</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Virtual Call Button */}
            <button
              onClick={() => {
                startVirtualCall(selectedLeadForChat);
                setSelectedLeadForChat(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Virtual Line</span>
            </button>

            <button
              onClick={() => setSelectedLeadForChat(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Templates bar */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 whitespace-nowrap">DLT Approved HSM Templates:</span>
          <button
            onClick={() =>
              handleUseTemplate(
                "Namaste {name} ji, thank you for reaching out via WhatsApp! I am placing a call shortly from our verified business line to discuss your requirements."
              )
            }
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Virtual Call Notice
          </button>
          <button
            onClick={() =>
              handleUseTemplate(
                "Hello {name}, sharing our enterprise pricing deck in INR (inclusive of GST 18%). Let's connect for a 15-minute walkthrough."
              )
            }
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Pricing Deck (GST)
          </button>
          <button
            onClick={() =>
              handleUseTemplate(
                "Dhanyavaad {name}, our meeting is confirmed for tomorrow 11:30 AM IST. Looking forward to speaking with you!"
              )
            }
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Meeting Confirm
          </button>
        </div>

        {/* Message Thread View */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
          <div className="text-center">
            <span className="text-[11px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              End-to-End Encrypted via Meta Cloud API India · PII Protected
            </span>
          </div>

          {selectedLeadForChat.whatsappThread.map((msg) => {
            const isAgent = msg.sender === 'agent';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[11px] text-slate-400 italic bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800/60">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    isAgent
                      ? 'bg-emerald-600/90 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/70 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="text-[10px] text-slate-300/80 mb-0.5 font-medium">
                    {msg.senderName}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/70 font-mono">
                    <span>{formatTimeAgo(msg.timestamp)}</span>
                    {isAgent && (
                      <span>
                        {msg.status === 'delivered' ? (
                          <CheckCheck className="w-3 h-3 text-emerald-300 inline" />
                        ) : (
                          <Check className="w-3 h-3 text-slate-300 inline" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a WhatsApp reply to send to lead..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
