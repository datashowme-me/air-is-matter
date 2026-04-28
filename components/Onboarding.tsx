import React, { useEffect, useState } from 'react';
import {
  Apple,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  MapPin,
  MonitorSmartphone,
  Sparkles,
  X,
} from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

const stepOrder: Step[] = [1, 2, 3];

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
      return;
    }

    onComplete();
  };

  const handleSkip = () => {
    onClose();
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-white/70 bg-[#fffaf2] shadow-[0_44px_120px_-48px_rgba(15,23,42,0.85)] lg:flex-row">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 14%, rgba(255, 184, 102, 0.22), transparent 28%), radial-gradient(circle at 84% 20%, rgba(255, 145, 88, 0.16), transparent 24%)',
          }}
        />

        <button
          onClick={handleSkip}
          className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white/85 p-2 text-slate-600 transition hover:bg-white hover:text-slate-900"
          aria-label="Close onboarding"
        >
          <X size={20} />
        </button>

        <div className="relative flex-1 overflow-y-auto p-7 sm:p-10 lg:p-14">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-orange-700">
              Quick setup
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              Step {currentStep} of 3
            </span>
          </div>

          <div className="mt-8 flex gap-3">
            {stepOrder.map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'w-24 bg-slate-950'
                    : step < currentStep
                    ? 'w-16 bg-orange-300'
                    : 'w-16 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {currentStep === 1 && (
            <div className="mt-10">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Search your city and generate the feed.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Air is Matter turns a city&apos;s 14-day AQI forecast into a private calendar subscription link. No file
                download, no separate app, and no account setup before you can try it.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Pick a city</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Search any supported location and pull in a live AQI forecast you can act on before the day starts.
                  </p>
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                    <Copy className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Copy the webcal link</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    The generated URL is your reusable subscription feed. Paste it once and let your calendar keep it fresh.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-orange-200 bg-[#fff4e5] p-5 text-sm leading-7 text-orange-950">
                <span className="font-semibold">Why this matters:</span> calendars are where decisions already happen.
                Putting AQI there means you see rough-air days next to commutes, workouts, and family plans.
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-10">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Paste it into the calendar you already use.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                The setup is intentionally boring: use your calendar&apos;s normal subscription flow and the AQI forecast
                starts showing up where your schedule already lives.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Google Calendar</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Open <span className="font-semibold text-slate-900">Other calendars</span>, choose{' '}
                        <span className="font-semibold text-slate-900">From URL</span>, then paste your feed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Apple className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Apple Calendar</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Use <span className="font-semibold text-slate-900">File → New Calendar Subscription</span>, then
                        paste the same webcal link and subscribe.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                      <MonitorSmartphone className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Outlook and mobile apps</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Most calendar apps that support subscribed webcal feeds can use the same URL without any special handling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-blue-950">
                <span className="font-semibold">Tip:</span> subscribed calendars refresh automatically. You do not need to
                download a new file every day.
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                You&apos;re set. The forecast now rides with your schedule.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Your calendar can now surface upcoming AQI conditions using quick visual cues like 🟢 🟡 🟠 🔴, so air quality
                becomes part of planning instead of an afterthought.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">What changes now</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                      <span>High-AQI days become visible before you commit to outdoor plans.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                      <span>The same feed works across devices that already share your calendar account.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                      <span>You keep the forecast habit without adding another app to check every morning.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">What to do next</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-3xl">
                    <span>🟢</span>
                    <span>🟡</span>
                    <span>🟠</span>
                    <span>🔴</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Try a city now, add the feed once, and watch the forecast settle into your regular planning loop.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-8">
            <button
              onClick={currentStep > 1 ? handlePrevious : handleSkip}
              className="text-base font-semibold text-slate-500 transition hover:text-slate-900"
            >
              {currentStep > 1 ? 'Back' : 'Skip walkthrough'}
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              {currentStep === 3 ? 'Start using Air is Matter' : 'Next step'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative hidden w-full overflow-hidden bg-gradient-to-br from-[#ff8c3b] via-[#ffb347] to-[#ffe5a3] p-10 text-slate-950 lg:flex lg:max-w-[31rem] lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="onboarding-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                  <path d="M 18 0 L 0 0 0 18" fill="none" stroke="white" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#onboarding-grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/80">Air is Matter</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-white">
              A forecast that works because it shows up where your plans already live.
            </h2>
          </div>

          <div className="relative z-10 mt-10 space-y-6">
            {currentStep === 1 && (
              <>
                <div className="rounded-[30px] border border-white/50 bg-white/88 p-6 shadow-2xl shadow-orange-900/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search preview</p>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <MapPin className="h-5 w-5 text-slate-300" />
                    <span className="text-sm font-medium text-slate-500">Type city name...</span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-[#fff4e5] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">London, UK</span>
                      <span className="text-xl">🟡</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">14-day AQI forecast ready to subscribe</p>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/40 bg-slate-950 p-6 text-white shadow-2xl shadow-orange-900/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Generated feed</p>
                  <code className="mt-4 block truncate text-sm text-[#ffd37a]">webcal://air-is-matter.com/api/ics?city=London</code>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="rounded-[30px] border border-white/50 bg-white/88 p-6 shadow-2xl shadow-orange-900/20">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Compatible platforms</p>
                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Google Calendar', icon: Calendar, tone: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'Apple Calendar', icon: Apple, tone: 'bg-slate-100 text-slate-700 border-slate-200' },
                    { label: 'Outlook and mobile', icon: MonitorSmartphone, tone: 'bg-[#fff2dd] text-[#ff7b2c] border-orange-100' },
                  ].map(({ label, icon: Icon, tone }) => (
                    <div key={label} className={`flex items-center gap-3 rounded-2xl border px-4 py-4 ${tone}`}>
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <>
                <div className="rounded-[30px] border border-white/50 bg-white/88 p-6 shadow-2xl shadow-orange-900/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Calendar week</p>
                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {[
                      { day: 'Mon', emoji: '🟢' },
                      { day: 'Tue', emoji: '🟡' },
                      { day: 'Wed', emoji: '🟠' },
                      { day: 'Thu', emoji: '🔴' },
                    ].map((item) => (
                      <div key={item.day} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.day}</p>
                        <div className="mt-3 text-2xl">{item.emoji}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/40 bg-slate-950 p-6 text-white shadow-2xl shadow-orange-900/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#ffd37a]" />
                    <span className="font-semibold">Auto-refreshing subscription</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Add the feed once and let your calendar quietly keep the forecast in sync.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
