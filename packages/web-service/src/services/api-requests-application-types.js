export const APPLICATION_TYPES = {
  select: async ({
    purposes,
    species,
    speciesSubjects,
    activities,
    methods
  }) => {
    const qryStr = JSON.stringify({
      ...(purposes && { purposes }),
      ...(species && { species }),
      ...(speciesSubjects && { speciesSubjects }),
      ...(activities && { activities }),
      ...(methods && { methods })
    })
    console.log(qryStr)
    // const dc = (qryStr)
    // const purposes2 = dc.purposes && JSON.parse(dc.purposes)
    // console.log(purposes2)
  }
}
