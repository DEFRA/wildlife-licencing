export const validateRouteRegister = (applicantJourney) => {
  const required = ['name', 'id']
  for (const prop of required) {
    for (const config of applicantJourney) {
      if (!(prop in config)) {
        throw new Error(`Route ${JSON.stringify(config)} is missing required config: ${prop}`)
      }
    }
  }
}
