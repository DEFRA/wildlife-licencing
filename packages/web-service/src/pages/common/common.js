export const timestampFormatter = ts => ts
  ? Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(ts))
  : null

export const timestampFormatterWithTime = ts => ts
  ? Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(ts))
  : null

export const yesNoFromBool = a => {
  if (a === undefined) {
    return '-'
  } else {
    return a ? 'yes' : 'no'
  }
}

export const boolFromYesNo = a => a === 'yes'
