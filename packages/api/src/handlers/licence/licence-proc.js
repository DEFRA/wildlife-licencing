export const prepareResponse = (a) =>
  (({ licence, ...l }) => l)(
    Object.assign(a, {
      ...a.licence,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      startDate:
        a.licence.startDate &&
        new Date(a.licence.startDate).toISOString().substring(0, 10),
      endDate:
        a.licence.endDate &&
        new Date(a.licence.endDate).toISOString().substring(0, 10)
    })
  )
