export const isDate = date => {
  const isValidDate = Date.parse(date)

  return !isNaN(isValidDate)
}
