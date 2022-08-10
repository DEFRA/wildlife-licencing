export const timestampFormatter = ts => ts
  ? Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(ts))
  : null
