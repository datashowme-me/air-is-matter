import React, { useState } from 'react';
import { X, ArrowRight, MapPin, Copy, Calendar, CheckCircle, Info } from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      onComplete();
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] max-h-[90vh]">

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close onboarding"
        >
          <X size={24} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Left side: Content */}
        <div className="flex-1 p-8 md:p-12 lg:p-20 flex flex-col justify-center">

          {/* Progress indicators */}
          <div className="flex gap-3 mb-12">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-20 rounded-full transition-colors duration-300 ${
                  step === currentStep
                    ? 'bg-orange-600'
                    : step < currentStep
                    ? 'bg-orange-300'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Get your unique URL */}
          {currentStep === 1 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-5 duration-500">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
                Step 1: Get your unique URL
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-xl">
                Search for your city to generate a personalized <span className="font-bold text-orange-600">Webcal link</span>.
                This unique URL allows you to sync real-time air quality forecasts directly to your favorite calendar application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl">
                    <MapPin className="text-orange-600 w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Pick a City</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter any location worldwide for precise PM2.5 tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl">
                    <Copy className="text-orange-600 w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Copy Link</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get a secure webcal:// address ready for your calendar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add to Calendar */}
          {currentStep === 2 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-5 duration-500 overflow-y-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
                Step 2: Add to Calendar
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                Follow these simple steps to paste your custom calendar link into your preferred desktop application.
              </p>

              <div className="space-y-10">
                {/* Google Calendar */}
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <Calendar className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Google Calendar</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Web & Desktop App</p>
                    </div>
                  </div>
                  <div className="space-y-4 pl-4">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        1
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        In the left sidebar, click the <span className="font-bold">+</span> icon next to{' '}
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm italic">
                          "Other calendars"
                        </span>.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        2
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Select <span className="font-bold text-orange-600">"From URL"</span> from the pop-up menu.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        3
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Paste your unique URL and click <span className="font-bold text-orange-600">Add calendar</span> to sync.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Apple Calendar */}
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                      <Calendar className="text-gray-700 dark:text-gray-300 w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apple Calendar</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">macOS Application</p>
                    </div>
                  </div>
                  <div className="space-y-4 pl-4">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        1
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Open the Calendar app, then click <span className="font-bold">File</span> in the top macOS menu bar.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        2
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Choose <span className="font-bold text-orange-600 italic">"New Calendar Subscription..."</span> from the list.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center text-orange-600">
                        3
                      </span>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Paste the URL and click <span className="font-bold text-orange-600">Subscribe</span>.
                        Adjust your alert settings as needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 flex items-start gap-4">
                <Info className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Pro tip:</strong> Subscribing via URL ensures your calendar automatically updates whenever
                  the air quality forecast changes. You don't need to download any files.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: All Set! */}
          {currentStep === 3 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-5 duration-500 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <CheckCircle className="text-green-600 dark:text-green-400 w-12 h-12" />
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                Step 3: All Set!
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-12">
                Your calendar will now automatically show the 14-day AQI forecast using intuitive emojis
                🟢 🟡 🟠 🔴 to help you plan your days better.
              </p>

              {/* Calendar Preview Mockup */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-w-md mx-auto">
                <div className="text-left mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">October 2024</h3>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <div className="text-center">Sun</div>
                  <div className="text-center">Mon</div>
                  <div className="text-center">Tue</div>
                  <div className="text-center">Wed</div>
                  <div className="text-center">Thu</div>
                  <div className="text-center">Fri</div>
                  <div className="text-center">Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Sample calendar days with AQI emojis */}
                  {[
                    { day: '1', emoji: '🟢' },
                    { day: '2', emoji: '🟢' },
                    { day: '3', emoji: '🟡' },
                    { day: '4', emoji: '🔴' },
                    { day: '5', emoji: '🟡' },
                    { day: '6', emoji: '🟢' },
                    { day: '7', emoji: '🟢' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-900/40 p-2 rounded aspect-square flex flex-col items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.day}</span>
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-10 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <button
              onClick={currentStep > 1 ? handlePrevious : handleSkip}
              className="text-gray-600 dark:text-gray-400 font-semibold hover:text-orange-600 transition-colors text-lg"
            >
              {currentStep > 1 ? 'Back' : 'Skip tour'}
            </button>
            <button
              onClick={handleNext}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-orange-200 dark:shadow-none transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 text-lg"
            >
              {currentStep === 3 ? 'Start Using' : 'Next Step'}
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* Right side: Visual illustration (hidden on mobile) */}
        <div className="hidden md:flex md:w-2/5 lg:w-[500px] bg-gradient-to-br from-orange-600 to-amber-500 relative items-center justify-center p-16">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 w-full space-y-8">
            {/* Illustration based on current step */}
            {currentStep === 1 && (
              <>
                <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-700">
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 mb-5">
                    <MapPin className="text-gray-400 w-5 h-5" />
                    <div className="h-3 w-40 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏙️</span>
                      <span className="font-bold text-orange-900 tracking-tight">London, UK</span>
                    </div>
                    <CheckCircle className="text-orange-400 w-6 h-6" />
                  </div>
                </div>
                <div className="flex justify-center -my-4 relative z-20">
                  <div className="bg-white p-3 rounded-full shadow-xl">
                    <ArrowRight className="text-orange-600 w-8 h-8 transform rotate-90" />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Webcal Generator
                    </span>
                  </div>
                  <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between gap-4 border border-gray-800">
                    <div className="flex-1 truncate">
                      <code className="text-orange-400 text-xs font-mono">webcal://aqi.cal/v1/u?id=4829...</code>
                    </div>
                    <div className="bg-orange-600/20 border border-orange-600/40 rounded-xl p-2.5 cursor-pointer">
                      <Copy className="text-orange-400 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-gray-800">
                    <Calendar className="w-10 h-10 text-blue-600" />
                    <h3 className="text-2xl font-bold">Calendar Apps</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <CheckCircle className="text-blue-600 w-5 h-5" />
                      <span className="font-semibold text-gray-800">Google Calendar</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <CheckCircle className="text-gray-600 w-5 h-5" />
                      <span className="font-semibold text-gray-800">Apple Calendar</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <CheckCircle className="text-gray-600 w-5 h-5" />
                      <span className="font-semibold text-gray-800">Outlook</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="text-green-600 w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">You're all set!</h3>
                <p className="text-gray-600 mb-6">
                  Your calendar now shows the 14-day AQI forecast with color-coded emojis.
                </p>
                <div className="flex justify-center gap-2 text-4xl">
                  <span>🟢</span>
                  <span>🟡</span>
                  <span>🟠</span>
                  <span>🔴</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
