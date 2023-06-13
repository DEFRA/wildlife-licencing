describe('submission spec', () => {
  beforeEach(() => jest.resetModules())

  describe('checkData', () => {
    it('the check data should return null if the all journeys are complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            submittedApplicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      jest.doMock('../../tasklist/licence-type.js', () => ({
        isAppSubmittable: () => { return true }
      }))

      const { checkData } = await import('../submission.js')
      expect(await checkData(request)).toBeNull()
    })

    it('the check data should redirect if the submittedApplicationId is not present', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      const { checkData } = await import('../submission.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/applications')
    })
  })

  it('the getData should return the current licence', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          submittedApplicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
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
          submittedApplicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
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
})
