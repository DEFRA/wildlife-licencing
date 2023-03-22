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
                paymentExemptReason: 101,
                paymentExemptReasonExplanation: 'I wont be paying because its a bridge I need to get onto my fields'
              }
            }
          }
        }
      }))
      const { getData } = await import('../work-payment-exempt-reason.js')
      expect(await getData(request)).toEqual(
        {
          CONSERVATION_OF_A_MONUMENT_OR_BUILDING: 452120006,
          CONSERVATION_OF_PROTECTED_SPECIES: 452120005,
          HOUSEHOLDER_HOME_IMPROVEMENTS: 452120001,
          OTHER: 452120007,
          PRESERVING_PUBLIC_HEALTH_AND_SAFETY: 452120000,
          PREVENT_DAMAGE_TO_LIVESTOCK_CROPS_TIMBER_OR_PROPERTY: 452120002,
          PREVENT_DISEASE_SPREAD: 452120003,
          SCIENTIFIC_RESEARCH_OR_EDUCATION: 452120004,
          paymentExemptReasonExplanation: 'I wont be paying because its a bridge I need to get onto my fields',
          radioChecked: 101
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
          paymentExemptReason: 100000013,
          example: 'just ensuring what we pull from the api is preserved'
        }
      )
    })

    it('setData for a radio input, and a text input works as expected', async () => {
      const mockUpdate = jest.fn()
      const OTHER = 452120007
      const request = {
        payload: {
          'work-payment-exempt-reason': `${OTHER}`,
          'exempt-details': 'we move this into the api now'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
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
          example: 'just ensuring what we pull from the api is preserved',
          paymentExemptReason: OTHER,
          paymentExemptReasonExplanation: 'we move this into the api now'
        }
      )
    })

    it('the completion function sets the tag status', async () => {
      const mockSet = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { set: mockSet }
            }
          }
        }
      }))
      const { completion } = await import('../work-payment-exempt-reason.js')
      await completion(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'complete-not-confirmed' })
    })

    it('the completion function returns the CYA uri', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-payment-exempt-reason.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })
  })
})
