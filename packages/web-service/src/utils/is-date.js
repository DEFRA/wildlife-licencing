export const isDate = date => {
  const isValidDate = Date.parse(date)

  if (isNaN(isValidDate)) {
    return false
  }

  return true
}
