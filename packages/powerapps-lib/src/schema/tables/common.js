// Converts booleans to the yes/no/na option set value
export const yesNoNASrc = s => s ? 100000000 : 100000001
export const yesNoNATgt = t => t === 100000000
