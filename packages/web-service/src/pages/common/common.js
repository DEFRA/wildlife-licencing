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

export const gridReferenceValidRegex = /^(H[OPTUW-Z]|N[A-HJ-PR-UW-Z]|OV|S[C-EHJKM-PR-Y]|T[AFGLMQR])\d{6}$/i
export const gridReferenceFormatRegex = /^[a-zA-Z]{2}\d{6}$/
