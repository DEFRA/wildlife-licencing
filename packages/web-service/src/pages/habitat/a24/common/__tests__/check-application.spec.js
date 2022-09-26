describe('The check-application function', () => {
  beforeEach(() => jest.resetModules())
  it('will return undefined if the user has an application id', async () => {
    const mockGetData = () => ({
      applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
    })
    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }
    const { checkApplication } = await import('../check-application.js')
    expect(await checkApplication(request)).toBeUndefined()
  })

  it('will return the applications uri if the user has not got an application id', async () => {
    const request = {
      cache: () => ({
        getData: () => ({})
      })
    }
    const { checkApplication } = await import('../check-application.js')
    expect(await checkApplication(request)).toBe('/applications')
  })
})
