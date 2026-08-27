// src/utils/calendarSync.ts
// RFC 5545 standard .ics generator and Google Calendar Direct URL builder

import { Trip, ItineraryDay, Activity } from '../types';

/**
 * Format a Date object or date-time string into standard iCal UTC/Local format (YYYYMMDDTHHMMSS)
 */
function formatICalDate(dateStr: string, timeStr?: string): { start: string; end: string } {
  try {
    const baseDate = new Date(dateStr);
    let startHour = 10;
    let startMinute = 0;
    let durationHours = 2;

    if (timeStr) {
      // Parse "09:00 AM" or "14:30"
      const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const ampm = match[3] ? match[3].toUpperCase() : null;

        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;

        startHour = h;
        startMinute = m;
      }
    }

    const startObj = new Date(baseDate);
    startObj.setHours(startHour, startMinute, 0, 0);

    const endObj = new Date(startObj);
    endObj.setHours(startHour + durationHours, startMinute, 0, 0);

    const pad = (n: number) => String(n).padStart(2, '0');

    const startFmt = `${startObj.getFullYear()}${pad(startObj.getMonth() + 1)}${pad(startObj.getDate())}T${pad(
      startObj.getHours()
    )}${pad(startObj.getMinutes())}00`;

    const endFmt = `${endObj.getFullYear()}${pad(endObj.getMonth() + 1)}${pad(endObj.getDate())}T${pad(
      endObj.getHours()
    )}${pad(endObj.getMinutes())}00`;

    return { start: startFmt, end: endFmt };
  } catch {
    const cleanDate = dateStr.replace(/[^0-9]/g, '').slice(0, 8) || '20260901';
    return {
      start: `${cleanDate}T100000`,
      end: `${cleanDate}T120000`,
    };
  }
}

/**
 * Clean text for iCal fields (escape commas, semicolons, backslashes)
 */
function escapeICalText(str: string = ''): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate full RFC 5545 .ics file content for a trip
 */
export function generateTripICS(trip: Trip): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripLink Travel Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(trip.title)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  (trip.days || []).forEach((day) => {
    (day.activities || []).forEach((act) => {
      const { start, end } = formatICalDate(day.date, act.time);
      const uid = `act-${act.id}-${day.id}@triplink.app`;
      const summary = `${act.name} (Day ${day.dayNumber})`;
      const location = act.location || day.destination;
      const description = [
        act.reason || '',
        act.notes ? `Notes: ${act.notes}` : '',
        act.estCost ? `Est. Cost: $${act.estCost}` : '',
        `Organized with TripLink`,
      ]
        .filter(Boolean)
        .join('\n\n');

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStamp}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${escapeICalText(summary)}`);
      lines.push(`LOCATION:${escapeICalText(location)}`);
      lines.push(`DESCRIPTION:${escapeICalText(description)}`);
      lines.push('STATUS:CONFIRMED');

      // 30-min reminder alert
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT30M');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Upcoming Stop: ${escapeICalText(act.name)}`);
      lines.push('END:VALARM');

      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger browser download of .ics calendar file
 */
export function downloadTripICS(trip: Trip): void {
  const icsContent = generateTripICS(trip);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (trip.title || 'Trip-Itinerary').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${safeName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate 1-Click Google Calendar event link for an individual activity
 */
export function buildGoogleCalendarUrl(dayDate: string, act: Activity, tripTitle?: string): string {
  const { start, end } = formatICalDate(dayDate, act.time);
  const title = encodeURIComponent(`${act.name} (${tripTitle || 'Trip'})`);
  const details = encodeURIComponent(
    `${act.reason || ''}\n${act.notes ? 'Notes: ' + act.notes : ''}\n${
      act.estCost ? 'Cost: $' + act.estCost : ''
    }\nPlanned with TripLink`
  );
  const location = encodeURIComponent(act.location || '');
  const dates = `${start}/${end}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
