/**
 * Consume Prepare output
 * @param user.dataValues
 * @returns {any}
 */
export const prepareResponse = u => Object.assign((({
  password,
  createdAt,
  updatedAt,
  _user,
  ...l
}) => l)(u), {
  createdAt: u.createdAt.toISOString(),
  updatedAt: u.updatedAt.toISOString(),
  ...u.user
})

export const alwaysExclude = payload => {
  delete payload.id
  delete payload.username
  delete payload.password
  delete payload.createdAt
  delete payload.updatedAt
  delete payload.cookiePrefs
  return payload
}
