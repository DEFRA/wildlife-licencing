/**
 * Consume Prepare output
 * @param application.dataValues
 * @returns {any}
 */
export const prepareResponse = a => Object.assign((({
  createdAt,
  updatedAt,
  userId,
  application,
  submitted,
  sddsId,
  ...l
}) => l)(a), {
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
  ...a.application
})
