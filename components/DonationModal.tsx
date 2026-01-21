import React from 'react';
import { X } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={24} className="text-slate-600" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Support Air is Matter ☕
          </h2>
          <p className="text-slate-600">
            Scan the QR code to make a donation
          </p>
        </div>

        {/* QR Code Image */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
            {/* Replace 'donation-qr.jpg' with your actual image filename */}
            <img
              src="/donation-qr.jpg"
              alt="Donation QR Code"
              className="w-64 h-64 object-contain"
              onError={(e) => {
                // Fallback if image not found
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-64 h-64 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-center p-4';
                fallback.innerHTML = '<p className="text-sm">Please add your QR code image to /public/donation-qr.jpg</p>';
                (e.target as HTMLElement).parentNode?.appendChild(fallback);
              }}
            />
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-slate-500">
          Your support helps keep this service free for everyone
        </p>
      </div>
    </div>
  );
};
