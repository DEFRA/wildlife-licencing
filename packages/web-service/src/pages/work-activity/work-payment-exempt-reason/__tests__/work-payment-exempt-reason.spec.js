describe('The work-payment-exempt-reason page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-payment-exempt-reason page', () => {
    it('getData returns the powerapps keys', async () => {
      const request = {
        cache: () => {
          return {
            getData: () => {
              return { applicationId: '123abc' }
            }
          }
        }
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return {
                applicationCategory: 101,
                paymentExemptReason: 'I wont be paying because its a bridge I need to get onto my fields'
              }
            }
          }
        }
      }))
      const { getData } = await import('../work-payment-exempt-reason.js')
      expect(await getData(request)).toEqual(
        {
          paymentExemptReason: 'I wont be paying because its a bridge I need to get onto my fields',
          radioChecked: 101,
          HOUSEHOLDER_HOME_IMPROVEMENTS: 100000013,
          LISTED_BUILDINGS: 452120002,
          OTHER: 452120001,
          SCHEDULED_MONUMENTS: 452120004,
          REGISTERED_PLACES_OF_WORSHIP: 100000006,
          TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT: 452120003
        }
      )
    })

    it('zero radio buttons chosen causes a joi error', async () => {
      const payload = { }
      try {
        const { validator } = await import('../work-payment-exempt-reason.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.details[0].message).toBe('"work-payment-exempt-reason" is required')
      }
    })

    it('zero user input causes a joi error, if the options selected was OTHER', async () => {
      const payload = { 'work-payment-exempt-reason': 452120001, 'exempt-details': '' }
      try {
        const { validator } = await import('../work-payment-exempt-reason.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.details[0].message).toBe('"exempt-details" is not allowed to be empty')
      }
    })

    it('validator returns undefined on no errors', async () => {
      const payload = { 'work-payment-exempt-reason': 452120001, 'exempt-details': 'licence is exempt due to government provisions' }
      const { validator } = await import('../work-payment-exempt-reason.js')
      expect(await validator(payload)).toBe(undefined)
    })

    it('setData for a radio input works as expected', async () => {
      const mockUpdate = jest.fn()
      const request = {
        payload: {
          'work-payment-exempt-reason': '100000013'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { example: 'just ensuring what we pull from the api is preserved' }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-payment-exempt-reason.js')
      expect(await setData(request)).toEqual(undefined)
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          applicationCategory: 100000013,
          example: 'just ensuring what we pull from the api is preserved'
        }
      )
    })

    it('setData for a radio input, and a text input works as expected', async () => {
      const mockUpdate = jest.fn()
      const request = {
        payload: {
          'work-payment-exempt-reason': '452120001',
          'exempt-details': 'we move this into the api now'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { example: 'just ensuring what we pull from the api is preserved' }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-payment-exempt-reason.js')
      expect(await setData(request)).toEqual(undefined)
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          applicationCategory: 452120001,
          example: 'just ensuring what we pull from the api is preserved',
          paymentExemptReason: 'we move this into the api now'
        }
      )
    })
  })
})
