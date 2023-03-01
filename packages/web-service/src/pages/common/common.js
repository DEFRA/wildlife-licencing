export const timestampFormatter = ts => ts
  ? Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(ts))
  : null

export const yesNoFromBool = a => {
  if (a === undefined) {
    return '-'
  } else {
    return a ? 'yes' : 'no'
  }
}

export const boolFromYesNo = a => a === 'yes'
