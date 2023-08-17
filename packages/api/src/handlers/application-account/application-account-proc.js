export const prepareResponse = (as) =>
  Object.assign((({ createdAt, updatedAt, ...l }) => l)(as), {
    createdAt: as.createdAt.toISOString(),
    updatedAt: as.updatedAt.toISOString()
  })
