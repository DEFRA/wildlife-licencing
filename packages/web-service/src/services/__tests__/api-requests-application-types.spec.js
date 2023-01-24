jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests application-types services', () => {
  beforeEach(() => jest.resetModules())
  it('create calls the API connector correctly', async () => {
    const mockGet = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        get: mockGet
      }
    }))
    const { APPLICATION_TYPES } = await import('../api-requests-application-types.js')
    await APPLICATION_TYPES.select({
      purposes: ['p1', 'p2', 'p3'],
      species: ['s1', 's2', 's3'],
      speciesSubjects: ['ss1', 'ss2', 'ss3'],
      activities: ['a1', 'a2', 'a3'],
      methods: ['m1', 'm2', 'm3']
    })
    expect(mockGet).toHaveBeenCalledWith('/application-types', 'query={"purposes":["p1","p2","p3"],"species":["s1","s2","s3"],"speciesSubjects":["ss1","ss2","ss3"],"activities":["a1","a2","a3"],"methods":["m1","m2","m3"]}')
  })
})
