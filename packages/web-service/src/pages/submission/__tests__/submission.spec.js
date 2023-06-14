describe('submission spec', () => {
  beforeEach(() => jest.resetModules())

  describe('checkData', () => {
    it('the check data should return null if the all journeys are complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      jest.doMock('../../tasklist/licence-type.js', () => ({
        isAppSubmittable: () => { return true }
      }))

      const { checkData } = await import('../submission.js')
      expect(await checkData(request)).toBeNull()
    })

    it('the check data should redirect if all the journeys aren\'t complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      jest.doMock('../../tasklist/licence-type.js', () => ({
        isAppSubmittable: () => { return false }
      }))
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }

      const { checkData } = await import('../submission.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledTimes(1)
      expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
    })
  })

  it('the getData should return the current licence', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
        })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({ id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb', applicationReferenceNumber: '123abc' })
        }
      }
    }))

    const { getData } = await import('../submission.js')
    expect(await getData(request)).toEqual({
      currentApplication: {
        id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
        applicationReferenceNumber: '123abc'
      }
    })
  })

  it('the getData function calls getById', async () => {
    const mockCall = jest.fn().mockImplementation(() => {
      return [
        {
          id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
          applicationReferenceNumber: '123abc'
        },
        {
          id: '35a6c59e-0faf-438b-b4d5',
          applicationReferenceNumber: '456zxc'
        }
      ]
    })

    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
        })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: mockCall
        }
      }
    }))

    const { getData } = await import('../submission.js')
    await getData(request)
    expect(mockCall).toHaveBeenCalledWith('35a6c59e-0faf-438b-b4d5-6967d8d075cb')
  })

  it('checks that an applicationId is set in the cache and returns a redirect if not', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({}))
      })
    }
    const mockRedirect = jest.fn(() => 'redirect')
    const h = {
      redirect: mockRedirect
    }
    const { checkApplication } = await import('../submission.js')
    const result = await checkApplication(request, h)
    expect(result).toEqual('redirect')
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })

  it('checkApplication returns null if there is an applicationId', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ applicationId: '123abc' }))
      })
    }
    const mockRedirect = jest.fn(() => 'redirect')
    const h = {
      redirect: mockRedirect
    }
    const { checkApplication } = await import('../submission.js')
    const result = await checkApplication(request, h)
    expect(result).toBeNull()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
