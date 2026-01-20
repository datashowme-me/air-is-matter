import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  MapPin, 
  Download, 
  CloudSun,
  Wind,
  Info,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Share2,
  Droplets,
  AlertTriangle,
  FileDown,
  Heart,
  Github
} from 'lucide-react';
import { fetchAQIForecast } from './services/geminiService';
import { generateICS, downloadICS, generateDataUri } from './utils/icsGenerator';
import { ForecastResponse, LoadingState, Pollutants } from './types';
import { ForecastChart } from './components/ForecastChart';

// Extend type locally since we added isOfficialData in service
type ExtendedForecastResponse = ForecastResponse & { isOfficialData?: boolean };

function App() {
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<ExtendedForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [icsDataUri, setIcsDataUri] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Ref to prevent double-fetching in React.StrictMode
  const initialSearchDone = useRef(false);

  // Check URL params on mount
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
    setIcsDataUri('');

    // Attempt to update URL history
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('city', query);
      window.history.pushState({}, '', url);
    } catch (e) {
      console.debug('History API not supported in this environment');
    }

    try {
      const result = await fetchAQIForecast(query);
      setData(result);
      
      const icsContent = generateICS(result);
      const dataUri = generateDataUri(icsContent);
      setIcsDataUri(dataUri);
      
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus(LoadingState.ERROR);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(city);
  };

  const handleDownloadCalendar = () => {
    if (!data) {
        // If user clicks the big yellow button but hasn't searched, trigger search
        if (city && status !== LoadingState.LOADING) {
            performSearch(city);
        }
        return;
    }
    const icsContent = generateICS(data);
    downloadICS(`AQI-Forecast-${data.city}.ics`, icsContent);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(icsDataUri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const PollutantCard = ({ label, value, unit = "μg/m³" }: { label: string, value?: number, unit?: string }) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-bold text-slate-800 mt-1">{value}</span>
        <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
    );
  };

  // Get current day data for the "Header" display
  const currentDay = data?.forecast[0];
  const currentPollutants = currentDay?.pollutants;

  // Determine emoji based on AQI (for the header)
  const getAqiEmoji = (aqi: number) => {
    if (aqi <= 50) return '🟢';
    if (aqi <= 100) return '🟡';
    if (aqi <= 150) return '🟠';
    if (aqi <= 200) return '🔴';
    if (aqi <= 300) return '🟣';
    return '🟤';
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      
      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row flex-grow min-h-[90vh]">
        
        {/* Left Column: Brand & Intro */}
        <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
            {/* Background pattern/decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <CloudSun size={400} className="absolute -top-20 -right-20 transform rotate-12" />
                <Wind size={300} className="absolute bottom-20 -left-20 transform -rotate-12" />
            </div>

            <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-3 mb-8 opacity-90">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <CalendarIcon size={28} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Breathe is Matter</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-sm">
                    Get the Air Quality Forecast with Icons in your Calendar
                </h1>
                
                <p className="text-lg lg:text-xl opacity-90 mb-10 leading-relaxed font-medium">
                    You can now get a 14-day Air Quality Index (AQI) forecast directly into your calendar. 
                    Works for all calendars supporting online .ics and emojis, like Google Calendar, Apple Calendar, and Outlook.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-white/20">
                    <div className="flex items-center gap-2 text-sm font-medium bg-black/20 backdrop-blur-md px-4 py-2 rounded-full self-start">
                         <Sparkles size={16} className="text-yellow-300" /> Powered by Gemini
                    </div>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium hover:bg-white/10 px-4 py-2 rounded-full transition-colors self-start">
                        <Heart size={16} className="text-red-200 fill-red-200" /> Support Project
                    </a>
                </div>
            </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-16 flex flex-col justify-center items-center relative">
            <div className="w-full max-w-md space-y-8">
                
                {/* Dynamic Header State */}
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm transition-all duration-500">
                    {data && currentDay ? (
                         <div className="animate-in fade-in slide-in-from-top-4">
                             <div className="flex items-center justify-center gap-2 text-4xl mb-2">
                                 <span>{getAqiEmoji(currentDay.aqi)}</span>
                                 <span className="font-bold text-slate-900">{currentDay.aqi}</span>
                             </div>
                             <h2 className="text-xl text-slate-600 font-medium">{data.city}, {data.country}</h2>
                             <p className="text-sm text-slate-400 mt-1">{currentDay.status}</p>
                         </div>
                    ) : (
                        <div className="text-slate-400 py-2">
                            <CloudSun size={48} className="mx-auto mb-2 opacity-30" />
                            <p className="text-lg font-medium">Enter a city to check AQI</p>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Type a city (e.g. New York)"
                            className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-full focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all placeholder:text-slate-300 text-center text-slate-800 font-medium"
                        />
                    </div>

                    {/* Toggles (Visual mostly, mimicking reference) */}
                    {data && (
                        <div className="flex justify-center gap-6 text-sm font-medium text-slate-500">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <div className="w-10 h-6 bg-orange-400 rounded-full relative">
                                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                 </div>
                                 <span>US AQI</span>
                             </label>
                             <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                                 <div className="w-10 h-6 bg-slate-200 rounded-full relative">
                                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                 </div>
                                 <span>Notifications</span>
                             </label>
                        </div>
                    )}

                    <button
                        type={data ? 'button' : 'submit'}
                        onClick={data ? handleDownloadCalendar : undefined}
                        disabled={status === LoadingState.LOADING || (!city && !data)}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {status === LoadingState.LOADING ? (
                            <>
                                <div className="animate-spin h-6 w-6 border-2 border-amber-900 border-t-transparent rounded-full"></div>
                                Generating...
                            </>
                        ) : data ? (
                            <>
                                <CalendarIcon size={24} /> Add to your Calendar
                            </>
                        ) : (
                            'Get Forecast'
                        )}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Manual Link / Fallback Area */}
                <div className="space-y-3 pt-4">
                    <p className="text-center text-slate-400 text-sm">
                        If the button doesn't work, copy the link below and subscribe manually in your calendar app.
                    </p>
                    
                    <div className="bg-slate-100 rounded-lg p-2 flex items-center gap-2 border border-slate-200">
                        <div className="flex-1 overflow-hidden">
                             <code className="block w-full text-xs text-slate-500 truncate px-2 font-mono">
                                {icsDataUri ? "data:text/calendar;charset=utf-8;base64,..." : "webcal://..."}
                             </code>
                        </div>
                        <button 
                            onClick={icsDataUri ? copyLinkToClipboard : undefined}
                            disabled={!icsDataUri}
                            className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-md text-xs font-bold shadow-sm border border-slate-200 transition-colors"
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    {data && data.isOfficialData && (
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <CheckCircle2 size={10} /> Official Sensor Data Used
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>

      {/* Bottom Section: Preview / Results (Calendar View Simulation) */}
      {status === LoadingState.SUCCESS && data && (
        <div className="bg-slate-50 border-t border-slate-200 py-16 px-4 md:px-8 animate-in slide-in-from-bottom-10 duration-700">
             <div className="max-w-5xl mx-auto">
                 <div className="text-center mb-10">
                     <h2 className="text-3xl font-bold text-slate-800 mb-2">Forecast Preview</h2>
                     <p className="text-slate-500">This is what the data looks like. It will be added to your calendar as all-day events.</p>
                 </div>

                 <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                     {/* Calendar Header Simulation */}
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                         <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                             <div className="w-3 h-3 rounded-full bg-green-400"></div>
                         </div>
                         <div className="text-sm font-semibold text-slate-500">
                             Calendar Preview - {data.city}
                         </div>
                         <div className="w-16"></div>
                     </div>
                    
                     <div className="p-6 md:p-10">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-6">
                            <Wind size={20} className="text-blue-500" /> 14-Day AQI Trend
                        </h3>
                        <ForecastChart data={data.forecast} />

                        {/* Detailed Stats Grid */}
                        <div className="mt-10 pt-10 border-t border-slate-100">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-6">
                                <Droplets size={20} className="text-blue-500" /> Current Details
                            </h3>
                            {currentPollutants ? (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <PollutantCard label="PM2.5" value={currentPollutants.pm2_5} />
                                    <PollutantCard label="PM10" value={currentPollutants.pm10} />
                                    <PollutantCard label="O3" value={currentPollutants.o3} />
                                    <PollutantCard label="NO2" value={currentPollutants.no2} />
                                    <PollutantCard label="CO" value={currentPollutants.co} />
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">Detailed pollutant data not available for this location.</p>
                            )}
                        </div>
                     </div>
                 </div>

                 <div className="mt-8 text-center text-slate-400 text-sm">
                     <p>Data sources: {data.sources.map(s => s.title).join(', ') || 'Gemini AI Estimation'}</p>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
}

export default App;