import { toZonedTime } from 'date-fns-tz'

export function isShiftActiveForUser(nowUTC: Date, userTimezone: string, template: any): boolean {
  const local = toZonedTime(nowUTC, userTimezone || 'UTC')
  const day = local.getDay()
  
  if (!template.active_days.includes(day)) return false

  const minsNow = local.getHours() * 60 + local.getMinutes()
  const [sh, sm] = template.shift_start.split(':').map(Number)
  const [eh, em] = template.shift_end.split(':').map(Number)
  
  const start = sh * 60 + sm
  const end = eh * 60 + em

  return start <= end
    ? minsNow >= start && minsNow <= end
    : minsNow >= start || minsNow <= end
}

export function didShiftJustStart(prevActive: boolean, nowActive: boolean) {
  return !prevActive && nowActive
}
