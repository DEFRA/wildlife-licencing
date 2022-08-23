export const invalidDate = (day, month, dateString) => {
  if (day > 31 || day <= 0) {
    return true
  }

  if (month > 12 || month <= 0) {
    return true
  }

  if (!(/^[\d-]*$/.test(dateString))) { // Validate we just have dashes and numbers
    return true
  }

  return false
}
