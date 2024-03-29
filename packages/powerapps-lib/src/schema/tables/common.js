// Helpers

export const yesNoNASrc = s => s ? 100000000 : 100000001
export const yesNoNATgt = t => t === 100000000

export const yesNoNASrcNeg = s => !s ? 100000000 : 100000001
export const yesNoNATgtNeg = t => t === 100000001

export const dateConvSrc = d => d.substring(0, 10)
export const dateConvTgt = d => `${d}T00:00:00.000Z`
