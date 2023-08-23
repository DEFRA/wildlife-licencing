describe('application-common-functions', () => {
  beforeEach(() => jest.resetModules())
  describe('checkData', () => {
    it('returns null if an applicationId is provided and belongs to the user', async () => {
      const mockFindRoles = jest.fn(() => ['USER'])
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findRoles: mockFindRoles
          }
        }
      }))

      const mockGetData = jest.fn(() => ({
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
        applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
      }))
      const request = {
        cache: () => ({
          getData: mockGetData
        }),
        query: { applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }
      }

      const { checkData } = await import('../application-common-functions.js')
      const result = await checkData(request, null)
      expect(result).toBeNull()
      expect(mockFindRoles).toHaveBeenCalledWith('3a0fd3af-cd68-43ac-a0b4-123b79aaa83b', '94de2969-91d4-48d6-a5fe-d828a244aa18')
    })

    it('returns a redirect to the applications page if an applicationId is provided and it does not belong to the user', async () => {
      const mockFindRoles = jest.fn(() => [])
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findRoles: mockFindRoles
          }
        }
      }))

      const mockGetData = jest.fn(() => ({
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
        applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
      }))
      const request = {
        cache: () => ({
          getData: mockGetData
        }),
        query: { applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }
      }

      const h = {
        redirect: jest.fn()
      }

      const { checkData } = await import('../application-common-functions.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('returns a redirect to the applications page if no applicationId and licenceId is provided', async () => {
      const request = {
        query: {}
      }

      const h = {
        redirect: jest.fn()
      }

      const { checkData } = await import('../application-common-functions.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
  })

  describe('send events', () => {
    it('findLastSentEvent sorts the send events correctly', async () => {
      const { findLastSentEvent } = await import('../application-common-functions.js')
      const result = findLastSentEvent({
        annotations: [
          {
            filename: '2023-510300-BAD-LIC-licence document.pdf',
            mimetype: 'application/pdf',
            modifiedOn: '2023-02-21T09:03:14Z',
            objectTypeCode: 'sdds_license'
          },
          {
            filename: '2023-510300-BAD-LIC-licence document.pdf',
            mimetype: 'application/pdf',
            modifiedOn: '2023-02-20T11:03:14Z',
            objectTypeCode: 'sdds_license'
          }
        ]
      })
      expect(result).toEqual({
        filename: '2023-510300-BAD-LIC-licence document.pdf',
        mimetype: 'application/pdf',
        modifiedOn: '2023-02-21T09:03:14Z',
        objectTypeCode: 'sdds_license'
      })
    })

    it('findLastSentEvent returns null with no annotations', async () => {
      const { findLastSentEvent } = await import('../application-common-functions.js')
      const result = findLastSentEvent({ })
      expect(result).toBeNull()
    })

    it('findLastSentEvent returns null with no events', async () => {
      const { findLastSentEvent } = await import('../application-common-functions.js')
      const result = findLastSentEvent({ annotations: [] })
      expect(result).toBeNull()
    })
  })

  describe('statues', () => {
    it('are as expected', async () => {
      const { statuses } = await import('../application-common-functions.js')
      expect(statuses).toEqual({
        1: 'RECEIVED',
        100000000: 'AWAITING_ALLOCATION',
        100000001: 'ALLOCATED_FOR_ASSESSMENT',
        100000002: 'UNDER_ASSESSMENT',
        100000004: 'GRANTED',
        100000005: 'PAUSED',
        100000008: 'NOT_GRANTED'
      })
    })
  })
})
