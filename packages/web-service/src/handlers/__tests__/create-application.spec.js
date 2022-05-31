
describe('the create-application handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the API and saves the journey data', async () => {
    const mockCreateApplication = jest.fn()
    const mockAssociateApplication = jest.fn()
    const mockRedirect = jest.fn()
    jest.doMock('../../services/application.js', () => ({
      ApplicationService: {
        createApplication: mockCreateApplication,
        associateApplication: mockAssociateApplication
      }
    }))
    const createApplication = (await import('../create-application.js')).default
    await createApplication({ }, { redirect: mockRedirect })
    expect(mockCreateApplication).toHaveBeenCalledWith({})
    expect(mockAssociateApplication).toHaveBeenCalledWith({}, 'USER')
    expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
  })
})
