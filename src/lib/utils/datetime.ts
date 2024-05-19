export const ONE_SECOND = 1000
export const ONE_MINUTE = ONE_SECOND * 60
export const ONE_HOUR = ONE_MINUTE * 60
export const ONE_DAY = ONE_HOUR * 24

export const MINUTES_IN_DAY = 1440
export const MINUTES_IN_MONTH = 43_200
export const MINUTES_IN_YEAR = 525_600

export const getTimeSinceShort = (date: Date) => {
  const milliseconds = Date.now() - date.getTime()

  // 0 to 60 seconds
  const seconds = Math.round(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  // 1 to 60 minutes
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }

  // 1 to 24 hours
  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours}h`
  }

  // 1 to 30 days
  const days = Math.round(minutes / MINUTES_IN_DAY)
  if (days < 30) {
    return `${days}d`
  }

  // 1 to 12 months
  const months = Math.round(minutes / MINUTES_IN_MONTH)
  if (months < 12) {
    return `${months}mo`
  }

  const years = Math.round(minutes / MINUTES_IN_YEAR)
  return `${years}y`
}

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
})
export const toPrettyDate = (date: Date) => {
  return formatter.format(date)
}
