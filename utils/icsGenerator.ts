import { ForecastResponse } from "../types";

export const generateICS = (data: ForecastResponse): string => {
  const { city, forecast } = data;
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Use current hostname for UID generation if available, otherwise default
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'breathe-is-matter.com';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Breathe is Matter//AQI Forecast//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:AQI Forecast - ${city}`,
    'X-WR-TIMEZONE:UTC',
  ];

  forecast.forEach((day, index) => {
    // Format date string YYYYMMDD
    const dateStr = day.date.replace(/-/g, '');
    
    // Create a unique UID using the dynamic domain
    const uid = `${timestamp}-${index}@${domain}`;

    // Determine emoji based on AQI
    let emoji = '🟢';
    if (day.aqi > 50) emoji = '🟡';
    if (day.aqi > 100) emoji = '🟠';
    if (day.aqi > 150) emoji = '🔴';
    if (day.aqi > 200) emoji = '🟣';
    if (day.aqi > 300) emoji = '🟤';

    // Format pollutants string
    let pollutantStr = '';
    if (day.pollutants) {
      const p = day.pollutants;
      const parts = [];
      if (p.pm2_5) parts.push(`PM2.5: ${p.pm2_5}`);
      if (p.pm10) parts.push(`PM10: ${p.pm10}`);
      if (p.o3) parts.push(`O3: ${p.o3}`);
      if (p.no2) parts.push(`NO2: ${p.no2}`);
      if (p.co) parts.push(`CO: ${p.co}`);
      
      if (parts.length > 0) {
        pollutantStr = `\\nPollutants (μg/m³): ${parts.join(', ')}`;
      }
    }

    icsContent = [
      ...icsContent,
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:${emoji} AQI: ${day.aqi} (${day.status})`,
      `DESCRIPTION:Forecast for ${city}. Status: ${day.status}. ${day.description}${pollutantStr}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT', // Show as "Free" so it doesn't block the user's calendar
      'END:VEVENT'
    ];
  });

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
};

export const generateDataUri = (content: string): string => {
  // Use UTF-8 compatible base64 encoding
  const base64 = btoa(unescape(encodeURIComponent(content)));
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
};

export const downloadICS = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};