import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Apple,
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarRange,
  Check,
  CheckCircle2,
  Clock3,
  CloudSun,
  Coffee,
  Copy,
  Droplets,
  HelpCircle,
  MapPin,
  MonitorSmartphone,
  Share2,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { fetchAQIForecast } from './services/weatherService';
import { ForecastResponse, AQIDataPoint, LoadingState } from './types';
import { ForecastChart } from './components/ForecastChart';
import { DonationModal } from './components/DonationModal';
import { Onboarding } from './components/Onboarding';

type ExtendedForecastResponse = ForecastResponse & { isOfficialData?: boolean };
type FeatureCard = {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const sampleForecast: AQIDataPoint[] = [
  { date: '2026-04-28', aqi: 38, status: 'Good', description: 'Clean enough for a morning run.', pollutants: { pm2_5: 9, pm10: 18 } },
  { date: '2026-04-29', aqi: 54, status: 'Moderate', description: 'Fine for errands, light haze later.', pollutants: { pm2_5: 17, pm10: 26 } },
  { date: '2026-04-30', aqi: 72, status: 'Moderate', description: 'Keep windows closed in the afternoon.', pollutants: { pm2_5: 24, pm10: 31 } },
  { date: '2026-05-01', aqi: 92, status: 'Moderate', description: 'Better for indoor workouts.', pollutants: { pm2_5: 31, pm10: 44 } },
  { date: '2026-05-02', aqi: 48, status: 'Good', description: 'Clear enough for outdoor plans.', pollutants: { pm2_5: 12, pm10: 19 } },
  { date: '2026-05-03', aqi: 61, status: 'Moderate', description: 'Watch for evening traffic buildup.', pollutants: { pm2_5: 21, pm10: 29 } },
  { date: '2026-05-04', aqi: 34, status: 'Good', description: 'A strong day for fresh air.', pollutants: { pm2_5: 8, pm10: 16 } },
];

const promiseCards: FeatureCard[] = [
  {
    eyebrow: 'Daily rhythm',
    title: 'See bad-air days where you already plan.',
    description: 'AQI forecast icons live inside your calendar instead of another tab you forget to check.',
    icon: CalendarRange,
  },
  {
    eyebrow: 'Always current',
    title: 'One subscription, automatic updates.',
    description: 'Paste the webcal link once and the 14-day forecast keeps refreshing in the background.',
    icon: Clock3,
  },
  {
    eyebrow: 'Built for the real world',
    title: 'Works across Google, Apple, and Outlook.',
    description: 'The same forecast feed travels across desktop, mobile, and the calendars your family already shares.',
    icon: MonitorSmartphone,
  },
];

const routineCards: FeatureCard[] = [
  {
    eyebrow: 'Commutes',
    title: 'Spot rough-air mornings before you leave.',
    description: 'Shift a ride, mask up, or pick a cleaner route before the city wakes up.',
    icon: Activity,
  },
  {
    eyebrow: 'Families',
    title: 'Plan school pickups and park time smarter.',
    description: 'Use the forecast as a quiet heads-up for outdoor play, allergies, or asthma-sensitive days.',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'Training',
    title: 'Protect workouts without killing momentum.',
    description: 'Know when to take the long run outside and when to swap for indoor sessions.',
    icon: Droplets,
  },
];

const setupSteps: FeatureCard[] = [
  {
    eyebrow: '01',
    title: 'Search your city.',
    description: 'Find any supported location and pull in the current 14-day AQI forecast.',
    icon: MapPin,
  },
  {
    eyebrow: '02',
    title: 'Copy the private webcal link.',
    description: 'Each city gets a subscription URL ready for Google Calendar, Apple Calendar, or Outlook.',
    icon: Copy,
  },
  {
    eyebrow: '03',
    title: 'Subscribe once and stay synced.',
    description: 'Your calendar keeps updating with AQI icons so bad-air days surface before the day starts.',
    icon: Sparkles,
  },
];

const platformBadges = [
  { label: 'Google Calendar', icon: CalendarIcon },
  { label: 'Apple Calendar', icon: Apple },
  { label: 'Outlook & mobile', icon: MonitorSmartphone },
];

const quickProof = ['No signup', 'No app install', 'Works with webcal:// subscriptions'];
const popularCities = ['Beijing', 'Los Angeles', 'London', 'Singapore', 'Delhi'];

const faqItems = [
  {
    question: 'Do I need to install a separate app?',
    answer:
      'No. Air is Matter generates a calendar subscription URL. You paste it into the calendar app you already use, and that app handles the sync.',
  },
  {
    question: 'Which calendar apps work with it?',
    answer:
      'Google Calendar, Apple Calendar, Outlook, and most calendar apps that support subscribed webcal feeds should work.',
  },
  {
    question: 'Will the AQI forecast update automatically?',
    answer:
      'Yes. Once you subscribe to the feed, your calendar app periodically refreshes it, so the upcoming 14-day forecast stays current without manual downloads.',
  },
  {
    question: 'Why put AQI inside a calendar at all?',
    answer:
      'Because calendars are where people already make decisions. Surfacing air quality next to meetings, school runs, and workouts makes the forecast far more likely to change behavior.',
  },
];

const formatSourceLabel = (uri: string) => {
  try {
    return new URL(uri).hostname.replace(/^www\./, '');
  } catch {
    return uri;
  }
};

const formatShortDay = (date: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));

const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

const getAqiEmoji = (aqi: number) => {
  if (aqi <= 50) return '🟢';
  if (aqi <= 100) return '🟡';
  if (aqi <= 150) return '🟠';
  return '🔴';
};

const getAqiTheme = (aqi?: number) => {
  if (aqi === undefined) {
    return {
      label: 'Waiting for a city',
      chipClass: 'bg-white/80 text-slate-700 ring-1 ring-white/80',
      accentClass: 'from-[#ff8c3b] via-[#ffb347] to-[#ffe066]',
      surfaceClass: 'border-orange-200/70 bg-orange-50/70 text-orange-900',
    };
  }

  if (aqi <= 50) {
    return {
      label: 'Good air',
      chipClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      accentClass: 'from-emerald-400 via-green-400 to-teal-300',
      surfaceClass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    };
  }

  if (aqi <= 100) {
    return {
      label: 'Moderate',
      chipClass: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
      accentClass: 'from-amber-400 via-yellow-300 to-orange-300',
      surfaceClass: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }

  if (aqi <= 150) {
    return {
      label: 'Sensitive groups beware',
      chipClass: 'bg-orange-100 text-orange-900 ring-1 ring-orange-200',
      accentClass: 'from-orange-500 via-orange-400 to-amber-300',
      surfaceClass: 'border-orange-200 bg-orange-50 text-orange-950',
    };
  }

  return {
    label: 'Unhealthy',
    chipClass: 'bg-rose-100 text-rose-900 ring-1 ring-rose-200',
    accentClass: 'from-rose-500 via-red-500 to-orange-400',
    surfaceClass: 'border-rose-200 bg-rose-50 text-rose-950',
  };
};

function App() {
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<ExtendedForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const initialSearchDone = useRef(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, []);

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

      const baseUrl = window.location.origin;
      const httpsUrl = `${baseUrl}/api/ics?city=${encodeURIComponent(result.city)}`;
      setSubscriptionUrl(httpsUrl.replace(/^https?:\/\//, 'webcal://'));
      setStatus(LoadingState.SUCCESS);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'city_input', {
          city_name: result.city,
          search_query: query,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus(LoadingState.ERROR);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'button_click', {
        button_name: 'get_the_forecast',
        city_query: city,
      });
    }

    performSearch(city);
  };

  const copyLinkToClipboard = () => {
    if (!subscriptionUrl) return;

    navigator.clipboard.writeText(subscriptionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'button_click', {
          button_name: 'copy',
          subscription_url: subscriptionUrl,
        });
      }
    });
  };

  const handleShare = () => {
    if (!data) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(data.city)}`;

    if (navigator.share) {
      navigator
        .share({
          title: `AQI Forecast for ${data.city}`,
          text: `Check out the 14-day air quality forecast for ${data.city} on Air is Matter!`,
          url: shareUrl,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    }
  };

  const handleAddToCalendar = () => {
    if (!subscriptionUrl) return;
    window.location.href = subscriptionUrl;
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOnboardingOpen(false);
  };

  const handlePopularCity = (name: string) => {
    setCity(name);
    performSearch(name);
  };

  const handleScrollToSearch = () => {
    document.getElementById('city-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const liveForecast = data?.forecast.filter((entry) => entry.date >= todayStr) ?? [];
  const previewForecast = liveForecast.length ? liveForecast.slice(0, 14) : sampleForecast;
  const currentDay = liveForecast.find((entry) => entry.date === todayStr) ?? liveForecast[0];
  const bestDay = liveForecast.length
    ? liveForecast.reduce((best, day) => (day.aqi < best.aqi ? day : best), liveForecast[0])
    : null;
  const toughestDay = liveForecast.length
    ? liveForecast.reduce((worst, day) => (day.aqi > worst.aqi ? day : worst), liveForecast[0])
    : null;
  const pm25Value = currentDay?.pollutants?.pm2_5;
  const pm10Value = currentDay?.pollutants?.pm10;
  const aqiTheme = getAqiTheme(currentDay?.aqi);
  const sourceLabels = data
    ? Array.from(
        new Set(
          data.sources
            .map((source) => formatSourceLabel(source.uri))
            .filter((label): label is string => Boolean(label)),
        ),
      ).slice(0, 3)
    : [];
  const sourceModeLabel = data
    ? data.isOfficialData
      ? 'Station-backed source'
      : 'Forecast model fallback'
    : null;

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-slate-900">
      <button
        onClick={() => setIsOnboardingOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-slate-900 active:translate-y-0"
        aria-label="Show tutorial"
        title="Show tutorial"
      >
        <HelpCircle size={18} />
        <span className="hidden sm:inline">How it works</span>
      </button>

      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 16%, rgba(255, 181, 71, 0.55), transparent 32%), radial-gradient(circle at 88% 14%, rgba(255, 136, 82, 0.26), transparent 28%), linear-gradient(180deg, #fff8ef 0%, #f7f1e8 58%, #f7f1e8 100%)',
          }}
        />
        <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-0 top-24 h-[30rem] w-[30rem] rounded-full bg-[#ffb347]/20 blur-3xl" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 pb-8 pt-6 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-[#ffd37a] shadow-[0_20px_50px_-26px_rgba(15,23,42,0.85)]">
              <CloudSun size={24} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Air is Matter</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Air quality calendar</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {platformBadges.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] backdrop-blur"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsDonationModalOpen(true)}
            className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:bg-white md:flex"
          >
            <Coffee size={16} className="text-[#ff7b2c]" />
            Support the project
          </button>
        </header>

        <main className="relative">
          <section className="mx-auto max-w-7xl px-6 pb-14 lg:px-10 lg:pb-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/75 px-4 py-2 text-sm font-semibold text-orange-700 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Live AQI forecasts, delivered through your calendar
                </div>

                <div className="space-y-5">
                  <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                    Plan around clean air, not surprises.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                    Air is Matter turns a city&apos;s 14-day AQI forecast into a live calendar feed, so rough-air days
                    show up before commutes, workouts, school pickups, and travel.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleScrollToSearch}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-[0_28px_70px_-28px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:bg-slate-900"
                  >
                    Try a city
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/70 px-6 py-4 text-base font-semibold text-slate-800 transition hover:border-slate-900/20 hover:bg-white"
                  >
                    See the setup flow
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 lg:hidden">
                  {platformBadges.map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] backdrop-blur"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {promiseCards.map(({ eyebrow, title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2dd] text-[#ff7b2c]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickProof.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_16px_30px_-26px_rgba(15,23,42,0.3)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="rounded-[32px] border border-white/70 bg-white/60 p-5 shadow-[0_32px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Calendar preview</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
                        Forecast icons before the day starts
                      </h2>
                    </div>
                    <div className="text-sm text-slate-500">
                      {data ? `${data.city} in view` : 'Sample week'}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {previewForecast.slice(0, 7).map((day) => (
                      <div
                        key={day.date}
                        className={`rounded-[22px] border p-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.55)] ${getAqiTheme(day.aqi).surfaceClass}`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{formatShortDay(day.date)}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-2xl">{getAqiEmoji(day.aqi)}</span>
                          <span className="text-sm font-semibold">AQI {day.aqi}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="city-search" className="relative">
                <div className="absolute inset-x-12 top-8 h-32 rounded-full bg-[#ffad42]/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-[0_40px_90px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8">
                  <div className="absolute right-[-72px] top-[-72px] h-48 w-48 rounded-full bg-[#fff3dc] blur-2xl" />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Live forecast generator</p>
                      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950">
                        {data ? `${data.city}${data.country ? `, ${data.country}` : ''}` : 'Choose a city'}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                        {currentDay
                          ? currentDay.description
                          : 'Search once, then add the feed to your calendar so polluted days appear before they become a problem.'}
                      </p>
                      {sourceModeLabel && (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {sourceModeLabel}
                        </p>
                      )}
                    </div>
                    <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${aqiTheme.chipClass}`}>
                      <span>{currentDay ? `AQI ${currentDay.aqi}` : 'AQI ready'}</span>
                      <span className="opacity-75">•</span>
                      <span>{aqiTheme.label}</span>
                    </div>
                  </div>

                  <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-[24px] border p-4 ${currentDay ? aqiTheme.surfaceClass : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-60">Current status</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Activity className="h-5 w-5" />
                        <span className="text-sm font-semibold">{currentDay?.status ?? 'Select a city to begin'}</span>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-slate-700">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">PM2.5</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-2xl font-semibold text-slate-950">{pm25Value !== undefined ? Math.round(pm25Value) : '—'}</span>
                        <Wind className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-slate-700">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">PM10</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-2xl font-semibold text-slate-950">{pm10Value !== undefined ? Math.round(pm10Value) : '—'}</span>
                        <Droplets className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="relative mt-6 space-y-4">
                    <label htmlFor="city-input" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Search a city
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                      <input
                        id="city-input"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Type city name..."
                        className="w-full rounded-[26px] border border-slate-200 bg-white px-14 py-5 text-lg font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900/30 focus:ring-4 focus:ring-[#ffecd4]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Popular starts</span>
                      {popularCities.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handlePopularCity(name)}
                          disabled={status === LoadingState.LOADING}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type={status === LoadingState.LOADING ? 'button' : 'submit'}
                        onClick={data ? handleAddToCalendar : undefined}
                        disabled={status === LoadingState.LOADING || (!city && !data)}
                        className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === LoadingState.LOADING ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : data ? (
                          <>
                            <CalendarIcon size={18} />
                            Add live feed to calendar
                          </>
                        ) : (
                          <>
                            Generate my AQI calendar
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>

                      {data && (
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
                        >
                          {shareCopied ? (
                            <>
                              <Check size={18} className="text-emerald-600" />
                              Copied link
                            </>
                          ) : (
                            <>
                              <Share2 size={18} />
                              Share city
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Try a city above, then subscribe once. The forecast stays inside the calendar workflow you already use every day.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                      {error}
                    </div>
                  )}

                  <div className="relative mt-5 rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_28px_70px_-36px_rgba(15,23,42,0.85)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Subscription URL</p>
                        <code className="mt-3 block truncate text-sm text-slate-100">
                          {subscriptionUrl || 'webcal://air-is-matter.com/api/ics?city=...'}
                        </code>
                      </div>
                      <button
                        onClick={copyLinkToClipboard}
                        disabled={!subscriptionUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {copied ? (
                          <>
                            <Check size={16} className="text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy link
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      Paste the feed into a new calendar subscription once. After that, the forecast keeps updating on
                      its own.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-500">
                    {(sourceLabels.length ? sourceLabels : ['Google Calendar', 'Apple Calendar', 'Outlook']).map((label) => (
                      <span key={label} className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <div className="grid gap-4 rounded-[36px] border border-white/70 bg-white/75 p-6 shadow-[0_32px_70px_-44px_rgba(15,23,42,0.42)] backdrop-blur lg:grid-cols-3 lg:p-8">
              <div className="rounded-[28px] border border-slate-100 bg-[#fff8ef] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Coverage</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">City-level AQI, ready for daily planning.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Search a location, grab the subscription link, and keep the forecast in the same place you already
                  manage travel, school, and training.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">No extra app habit</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">AQI alerts without another dashboard.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The forecast shows up right beside meetings and errands, so you actually notice it when it matters.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Setup time</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Search, copy, subscribe.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  That is the full setup. No file download, no manual refresh, no extra admin after the first paste.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Use it for real decisions</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  The air forecast belongs in your routine, not in a forgotten bookmark.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Air quality is only useful if you see it before you leave home. This landing page keeps the promise tied
                to everyday behavior instead of raw pollution data alone.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {routineCards.map(({ eyebrow, title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[32px] border border-white/70 bg-white/75 p-7 shadow-[0_28px_65px_-42px_rgba(15,23,42,0.42)] backdrop-blur"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-[#ffd37a]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#fffaf2] py-16">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">How it works</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Built for a fast setup, then designed to disappear.
                </h2>
                <p className="text-lg leading-8 text-slate-600">
                  The product should feel invisible after the first minute. Search a city, subscribe once, and let your
                  calendar become the reminder layer.
                </p>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900/20 hover:bg-slate-50"
                >
                  Open the walkthrough
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="grid gap-4">
                {setupSteps.map(({ eyebrow, title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="flex flex-col gap-5 rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)] sm:flex-row sm:items-start sm:p-7"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#fff2dd] text-[#ff7b2c]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Questions people will ask</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Clear the last doubts before someone subscribes.
                </h2>
                <p className="text-lg leading-8 text-slate-600">
                  This section does real landing-page work: it reduces uncertainty around setup, compatibility, and why
                  the calendar format is useful in the first place.
                </p>
              </div>

              <div className="grid gap-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.38)] backdrop-blur"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
                      <span className="text-xl font-semibold tracking-tight text-slate-950">{item.question}</span>
                      <span className="rounded-full bg-[#fff2dd] px-3 py-1 text-sm font-semibold text-[#ff7b2c] transition group-open:bg-slate-950 group-open:text-[#ffd37a]">
                        Open
                      </span>
                    </summary>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {data && currentDay && (
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Loaded forecast</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    {data.city} is live in the calendar flow.
                  </h2>
                </div>
                <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${aqiTheme.chipClass}`}>
                  <CheckCircle2 size={16} />
                  {aqiTheme.label}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">14-day view</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">AQI trend and upcoming pressure points</h3>
                    </div>
                    <div className="text-sm text-slate-500">Synced from live source data</div>
                  </div>
                  <ForecastChart data={previewForecast} />
                </div>

                <div className="grid gap-6">
                  <div className={`rounded-[34px] border p-7 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.45)] ${aqiTheme.surfaceClass}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-65">Today</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight">AQI {currentDay.aqi}</h3>
                    <p className="mt-3 text-sm leading-7 opacity-85">{currentDay.description}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] bg-white/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Best upcoming day</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">
                          {bestDay ? `${formatShortDate(bestDay.date)} · AQI ${bestDay.aqi}` : '—'}
                        </p>
                      </div>
                      <div className="rounded-[24px] bg-white/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Most difficult day</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">
                          {toughestDay ? `${formatShortDate(toughestDay.date)} · AQI ${toughestDay.aqi}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[34px] border border-white/70 bg-white/80 p-7 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.45)] backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sources</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Data trust stays visible.</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      The landing page surfaces where the forecast came from instead of hiding the provenance.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {sourceModeLabel && (
                        <span className="rounded-full border border-orange-200 bg-[#fff4e5] px-3 py-1.5 text-sm text-orange-900">
                          {sourceModeLabel}
                        </span>
                      )}
                      {sourceLabels.map((label) => (
                        <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 lg:px-10">
            <div className="overflow-hidden rounded-[38px] bg-slate-950 px-8 py-10 text-white shadow-[0_44px_90px_-48px_rgba(15,23,42,0.9)] sm:px-10 sm:py-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ffd37a]">Last call</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    Let your calendar warn you before the air does.
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                    Search a city, subscribe once, and keep the forecast inside the place you already trust to run the day.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleScrollToSearch}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd37a] px-6 py-4 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#ffde96]"
                  >
                    Start with a city
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => setIsDonationModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    <Coffee size={18} className="text-[#ffd37a]" />
                    Support Air is Matter
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Built for Google Calendar, Apple Calendar, Outlook, and mobile calendar apps.</span>
                <span>© 2026 Air is Matter. AQI planning without another app habit.</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
      <Onboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

export default App;
