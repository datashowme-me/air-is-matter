import React, { useEffect, useState } from 'react';
import { CheckCircle2, Coffee, ShieldCheck, Sparkles, X } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supportPoints = [
  'Keeps the public AQI calendar free to use.',
  'Funds polish, stability, and better forecast UX.',
  'Lets the product stay lightweight instead of pushing aggressive signup funnels.',
];

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-[#fffaf2] shadow-[0_44px_120px_-48px_rgba(15,23,42,0.85)] animate-in zoom-in duration-300">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 14% 12%, rgba(255, 184, 102, 0.2), transparent 28%), radial-gradient(circle at 88% 16%, rgba(255, 145, 88, 0.16), transparent 24%)',
          }}
        />

        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white/85 p-2 text-slate-600 transition hover:bg-white hover:text-slate-900"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 grid gap-8 p-7 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-orange-700">
              <Coffee className="h-4 w-4" />
              Support Air is Matter
            </div>

            <div>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Help keep the AQI calendar simple and public.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                If this tool helps you plan around pollution, a donation helps keep it online, lightweight, and useful
                without turning it into another noisy growth funnel.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">Why donate</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Small support gives the project room to improve data presentation and reliability without forcing ads
                  or account walls.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">What it supports</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Better landing-page clarity, forecast UX, onboarding, and the quiet maintenance work that keeps the
                  core experience trustworthy.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-200 bg-[#fff4e5] p-5">
              <ul className="space-y-3 text-sm leading-7 text-orange-950">
                {supportPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-orange-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Donation QR</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Scan and support</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use your preferred payment app to scan the code below. The support goes straight to keeping this project moving.
            </p>

            <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              {imageError ? (
                <div className="flex h-64 items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-6 text-center text-sm leading-7 text-slate-500">
                  Add the QR image to <span className="mx-1 font-semibold text-slate-900">/public/donation-qr.jpg</span> to
                  display it here.
                </div>
              ) : (
                <img
                  src="/donation-qr.jpg"
                  alt="Donation QR code"
                  className="mx-auto h-64 w-64 rounded-[20px] object-contain"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className="mt-5 rounded-[22px] bg-slate-950 px-4 py-4 text-sm leading-7 text-slate-300">
              No account is required on this site to support it. Scan, donate if you want to, and get back to planning cleaner days.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
