import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

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

  it('the NSIP page completion causes a redirect to the window-not open page if the current date is in the warning window and NSIP is false', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'))
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({
            applicationTypeId: PowerPlatformKeys.APPLICATION_TYPES.A24
          })
        }
      }
    }))
    const { completion } = await import('../nsip.js')
    const request = {
      payload: { 'yes-no': 'no' },
      cache: () => ({
        getData: () => ({ applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85' })
      })
    }
    const result = await completion(request)
    expect(result).toEqual('/window-not-open')
  })

  it('the NSIP page completion causes a redirect to the landowner page if the current date is not in the warning window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-08-01'))
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({
            applicationTypeId: PowerPlatformKeys.APPLICATION_TYPES.A24
          })
        }
      }
    }))
    const { completion } = await import('../nsip.js')
    const request = {
      payload: { 'yes-no': 'yes' },
      cache: () => ({
        getData: () => ({ applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85' })
      })
    }
    const result = await completion(request)
    expect(result).toEqual('/user-role')
  })

  it('the NSIP page completion causes a redirect to the landowner page if NSIP is true', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'))
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({
            applicationTypeId: PowerPlatformKeys.APPLICATION_TYPES.A24
          })
        }
      }
    }))
    const { completion } = await import('../nsip.js')
    const request = {
      payload: { 'yes-no': 'yes' },
      cache: () => ({
        getData: () => ({ applicationId: 'fedb14b6-53a8-ec11-9840-0022481aca85' })
      })
    }
    const result = await completion(request)
    expect(result).toEqual('/user-role')
  })
})
