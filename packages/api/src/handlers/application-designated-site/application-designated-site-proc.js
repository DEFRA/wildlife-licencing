export const prepareResponse = a => Object.assign((({
  createdAt,
  updatedAt,
  applicationId,
  submitted,
  sddsApplicationDesignatedSiteId,
  designatedSite,
  updateStatus,
  ...l
}) => l)(a), {
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
  ...a.designatedSite
})

export const alwaysExclude = payload => {
  const result = Object.assign({}, payload)
  delete result.id
  delete result.applicationId
  delete result.designatedSiteId
  delete result.sddsApplicationDesignatedSiteId
  delete result.createdAt
  delete result.updatedAt
  return result
}
