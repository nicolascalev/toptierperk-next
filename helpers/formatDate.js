import moment from "moment-timezone"

const allowedFormats = {
  'SHORT_TEXT': 'MMM Do YY',
}

export default function formatDate(timestamp, format) {
  const formatNames = Object.keys(allowedFormats)
  if (!allowedFormats[format]) {
    throw new Error('format must be in ' + formatNames.join(','))
  }

  return moment(timestamp).tz('America/Costa_Rica').format(allowedFormats[format])
}

export function timeAgo(timestamp) {
  return moment(timestamp).tz('America/Costa_Rica').startOf('hour').fromNow()
}