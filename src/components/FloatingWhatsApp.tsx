"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export default function FloatingWhatsApp({ whatsappNumber }: FloatingWhatsAppProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20Glam%20Lounge%20Luxury%20Salon.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] border border-[#25D366]/20 transition-all duration-300 transform hover:-translate-y-1 block hover:scale-105 peer relative"
        aria-label="Chat on WhatsApp"
        style={{ animation: 'heartbeat 3s infinite' }}
      >
        <MessageCircle size={24} className="fill-current text-white" />
        
        {/* Soft notification light pulse */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
      </a>
      
      <style jsx global>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
