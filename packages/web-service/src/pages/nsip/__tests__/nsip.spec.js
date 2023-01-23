describe('The NSIP page', () => {
  beforeEach(() => jest.resetModules())

  it('the NSIP page getData function gets the nsip flag', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({ nationallySignificantInfrastructure: true })
        }
      }
    }))
    const { getData } = await import('../nsip.js')
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '00ed369a-6765-45e3-bdad-546b774319f5' })
      })
    }
    const result = await getData(request)
    expect(result).toEqual({ yesNo: true })
  })

  it('the NSIP page setData function stores the nsip flag', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({ nationallySignificantInfrastructure: true, preserve: 'this' }),
          update: mockUpdate
        }
      }
    }))
    const { setData } = await import('../nsip.js')
    const request = {
      payload: { 'yes-no': 'yes' },
      cache: () => ({
        getData: () => ({ applicationId: '00ed369a-6765-45e3-bdad-546b774319f5' })
      })
    }
    await setData(request)
    expect(mockUpdate).toHaveBeenCalledWith('00ed369a-6765-45e3-bdad-546b774319f5', {
      nationallySignificantInfrastructure: true,
      preserve: 'this'
    })
  })
})
