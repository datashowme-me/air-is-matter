import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  CloudSun,
  Wind,
  CheckCircle2,
  Droplets,
  Heart,
  Coffee,
  Copy,
  Check,
  Sun,
  Cloud,
  Activity,
  Share2
} from 'lucide-react';
import { fetchAQIForecast } from './services/weatherService';
import { generateICS, downloadICS } from './utils/icsGenerator';
import { ForecastResponse, LoadingState } from './types';
import { ForecastChart } from './components/ForecastChart';
import { DonationModal } from './components/DonationModal';

type ExtendedForecastResponse = ForecastResponse & { isOfficialData?: boolean };

function App() {
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<ExtendedForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const initialSearchDone = useRef(false);

  useEffect(() => {
    if (initialSearchDone.current) return;
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam) {
      setCity(cityParam);
      performSearch(cityParam);
      initialSearchDone.current = true;
    }
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setStatus(LoadingState.LOADING);
    setError(null);
    setData(null);
    setSubscriptionUrl('');

    try {
      const result = await fetchAQIForecast(query);
      setData(result);

      // Construct a real URL for calendar subscription
      const baseUrl = window.location.origin;
      const subUrl = `${baseUrl}/api/ics?city=${encodeURIComponent(result.city)}`;
      setSubscriptionUrl(subUrl);

      setStatus(LoadingState.SUCCESS);

      // Track city search in Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'city_input', {
          city_name: result.city,
          search_query: query
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus(LoadingState.ERROR);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(city);
  };

  const copyLinkToClipboard = () => {
    if (!subscriptionUrl) return;
    navigator.clipboard.writeText(subscriptionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (!data) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(data.city)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `AQI Forecast for ${data.city}`,
        text: `Check out the 14-day air quality forecast for ${data.city} on Air is Matter!`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    }
  };

  const handleAddToCalendar = () => {
    if (!subscriptionUrl) return;
    // webcal:// protocol opens the calendar app directly
    const webcalUrl = subscriptionUrl.replace(/^https?:\/\//, 'webcal://');
    window.location.href = webcalUrl;
  };

  const handleDonationClick = () => {
    setIsDonationModalOpen(true);
  };

  const handleCloseDonationModal = () => {
    setIsDonationModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDay = data?.forecast.find(f => f.date === todayStr) || data?.forecast[0];
  const pm25Value = currentDay?.pollutants?.pm2_5;
  const pm10Value = currentDay?.pollutants?.pm10;

  const getBrandingBackground = () => {
    if (!data || !currentDay) return "from-[#ff5b00] via-[#ff9a00] to-[#ffc800]";
    const aqi = currentDay.aqi;
    if (aqi <= 50) return "from-emerald-500 via-green-500 to-teal-400";
    if (aqi <= 100) return "from-amber-400 via-yellow-400 to-amber-300";
    if (aqi <= 150) return "from-orange-500 via-orange-400 to-amber-500";
    return "from-red-600 via-red-500 to-rose-500";
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <div className="flex flex-col lg:flex-row flex-grow min-h-[95vh]">
        
        {/* Left Side: Branding */}
        <div className={`lg:w-1/2 bg-gradient-to-br ${getBrandingBackground()} text-white p-10 lg:p-24 flex flex-col justify-center relative overflow-hidden transition-colors duration-700 ease-in-out`}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-10 -right-20 w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-20"></div>
                <CloudSun size={600} className="absolute -top-32 -right-32 transform rotate-12" />
            </div>
            
            <div className="relative z-10 max-w-2xl">
                <h1 className="text-6xl lg:text-[88px] font-extrabold leading-[1] mb-10 tracking-tight drop-shadow-sm">
                    Get the Air Quality Forecast with Icons in your Calendar
                </h1>
                
                <p className="text-xl lg:text-[22px] opacity-100 mb-12 leading-[1.4] font-semibold max-w-xl">
                    You can now get the air quality forecast directly into your calendar. This local air quality calendar uses emojis 🟢 🟡 🔴 🌤️ to display a 14 days forecast.
                    Works for Google Calendar, Apple Calendar, and Outlook.
                </p>

                <div className="flex flex-wrap gap-5 items-center">
                    <button
                        onClick={handleDonationClick}
                        className="bg-white text-slate-900 px-8 py-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-md active:scale-95"
                    >
                        Make a donation <Coffee size={24} className="text-[#ff5b00]" />
                    </button>
                </div>
            </div>
        </div>

        {/* Right Side: UI Control */}
        <div className="lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-16">
            <div className="w-full max-w-md space-y-12">
                
                <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-center gap-4 border border-slate-100 shadow-sm min-h-[80px]">
                    {data ? (
                        <div className="flex items-center gap-3 text-3xl text-slate-800 animate-in fade-in zoom-in duration-500">
                             <Activity size={36} className="text-[#ff9a00]" />
                             <span className="font-bold tracking-tight">AQI {currentDay?.aqi || '--'}</span>
                             <span className="text-slate-400 text-2xl font-medium truncate max-w-[200px]">{data.city}</span>
                        </div>
                    ) : (
                        <div className="text-slate-300 flex items-center gap-3">
                             <Wind size={28} className="animate-pulse" />
                             <span className="font-medium text-lg tracking-tight">Search a city to see current AQI</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSearch} className="space-y-8">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Type city name..."
                        className="w-full px-8 py-6 text-2xl border-[3px] border-slate-100 rounded-[28px] focus:ring-8 focus:ring-orange-50 focus:border-[#ff5b00] outline-none transition-all placeholder:text-slate-300 text-center font-medium"
                    />

                    <div className="flex justify-center items-center gap-12 py-2">
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-[#94a3b8] tracking-tight">PM2.5</span>
                            <div className="w-16 h-8 bg-amber-400 rounded-full relative shadow-inner">
                                <div className="absolute right-1.5 top-1.5 w-5 h-5 bg-white rounded-full"></div>
                            </div>
                            <span className={`text-xl font-bold tracking-tight ${data ? 'text-slate-800' : 'text-slate-300'}`}>
                              {pm25Value !== undefined ? Math.round(pm25Value) : '0'}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-[#94a3b8] tracking-tight">PM10</span>
                            <div className="w-16 h-8 bg-amber-400 rounded-full relative shadow-inner">
                                <div className="absolute right-1.5 top-1.5 w-5 h-5 bg-white rounded-full"></div>
                            </div>
                            <span className={`text-xl font-bold tracking-tight ${data ? 'text-slate-800' : 'text-slate-300'}`}>
                              {pm10Value !== undefined ? Math.round(pm10Value) : '0'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            type={status === LoadingState.LOADING ? 'button' : 'submit'}
                            onClick={data ? handleAddToCalendar : undefined}
                            disabled={status === LoadingState.LOADING || (!city && !data)}
                            className="w-full bg-[#ffc100] hover:bg-[#ffb000] text-amber-950 text-2xl font-extrabold py-6 rounded-[24px] shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-4"
                        >
                            {status === LoadingState.LOADING ? (
                                <div className="animate-spin h-7 w-7 border-[3px] border-amber-900 border-t-transparent rounded-full"></div>
                            ) : data ? (
                              <>
                                <CalendarIcon size={28} className="stroke-[2.5px]" />
                                Add to your Calendar
                              </>
                            ) : 'Get the Forecast'}
                        </button>

                        {data && (
                            <button
                                type="button"
                                onClick={handleShare}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl font-bold py-4 rounded-[20px] transition-all flex items-center justify-center gap-3 border border-slate-200"
                            >
                                {shareCopied ? (
                                    <><Check size={22} className="text-green-600" /> Copied Link!</>
                                ) : (
                                    <><Share2 size={22} /> Share Forecast</>
                                )}
                            </button>
                        )}
                    </div>
                </form>

                {error && <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-base text-center font-bold border border-red-100">{error}</div>}

                <div className="space-y-5 pt-8">
                    <p className="text-center text-slate-500 text-sm leading-relaxed px-10 font-medium">
                        To subscribe, copy this URL and add it to your calendar app as a "New Calendar Subscription".
                    </p>
                    
                    <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-5 border border-slate-100 group relative">
                        <div className="flex-1 overflow-hidden">
                             <code className="block w-full text-[13px] text-slate-400 truncate font-mono select-all">
                                {subscriptionUrl ? subscriptionUrl : "https://air-is-matter.com/api/ics?city=..."}
                             </code>
                        </div>
                        <button 
                            onClick={copyLinkToClipboard}
                            disabled={!subscriptionUrl}
                            className="bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl text-sm font-extrabold border border-slate-200 shadow-sm transition-all disabled:opacity-30"
                        >
                            {copied ? <Check size={18} className="text-green-500 stroke-[3px]" /> : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {data && (
        <div className="bg-slate-50 border-t border-slate-200 py-24 px-6">
             <div className="max-w-6xl mx-auto">
                 <div className="text-center mb-16">
                     <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Forecast Preview</h2>
                     <p className="text-slate-500 text-xl font-medium">Detailed data synced directly to your devices.</p>
                 </div>
                 <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                     <div className="p-10 lg:p-16">
                        <ForecastChart data={data.forecast} />
                        <div className="mt-16 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="flex items-start gap-6">
                                <div className="bg-blue-50 p-4 rounded-3xl text-blue-500"><Wind size={28} /></div>
                                <div><h4 className="font-bold text-xl mb-1">Live Updates</h4><p className="text-slate-500">Auto-syncs daily with the latest reporting.</p></div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="bg-green-50 p-4 rounded-3xl text-green-500"><CheckCircle2 size={28} /></div>
                                <div><h4 className="font-bold text-xl mb-1">Global Data</h4><p className="text-slate-500">Official AQICN station coverage.</p></div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="bg-orange-50 p-4 rounded-3xl text-orange-500"><Droplets size={28} /></div>
                                <div><h4 className="font-bold text-xl mb-1">Universal</h4><p className="text-slate-500">Compatible with iOS, Android, and macOS.</p></div>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={handleCloseDonationModal}
      />
    </div>
  );
}

export default App;