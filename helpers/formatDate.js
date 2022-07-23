import moment from "moment"

const allowedFormats = {
  'SHORT_TEXT': 'MMM Do YY',
}

export default function formatDate(timestamp, format) {
  const formatNames = Object.keys(allowedFormats)
  if (!allowedFormats[format]) {
    throw new Error('format must be in ' + formatNames.join(','))
  }

  return moment(timestamp).format(allowedFormats[format])
}