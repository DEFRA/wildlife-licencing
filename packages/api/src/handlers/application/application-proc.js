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
  targetKeys,
  sddsApplicationId,
  updateStatus,
  userSubmission,
  ...l
}) => l)(a), {
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
  submitted: a.submitted?.toISOString(),
  userSubmission: !!a.userSubmission,
  ...a.application
})

export const alwaysExclude = payload => {
  delete payload.statusCode
  delete payload.submitted
  delete payload.userSubmission
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
