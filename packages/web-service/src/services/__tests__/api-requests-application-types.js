jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests application-types services', () => {
  beforeEach(() => jest.resetModules())
  it('create calls the API connector correctly', async () => {
    const { APPLICATION_TYPES } = await import('../api-requests-application-types.js')
    await APPLICATION_TYPES.select({
      purposes: ['p1', 'p2', 'p3'],
      species: ['s1', 's2', 's3']
    })
  })
})
