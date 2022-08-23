export const invalidDate = (day, month, dateString) => (day > 31 || day <= 0) || (month > 12 || month <= 0) || (!(/^[\d-]*$/.test(dateString)))
