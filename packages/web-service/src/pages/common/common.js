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

export const gridReferenceValidRegex = /^(?=HO|HP|HT|HU|HW|HX|HY|HZ|NA|NB|NC|ND|NE|NF|NG|NH|NJ|NK|NL|NM|NN|NO|NP|NR|NS|NT|NU|NW|NX|NY|NZ|OV|SC|SD|SE|TA|SH|SJ|SK|TF|TG|SM|SN|SO|SP|TL|TM|SR|SS|ST|SU|TQ|TR|SV|SW|SX|SY)[a-zA-Z]{2}\d{6}$/
export const gridReferenceFormatRegex = /^[a-zA-Z]{2}\d{6}$/
