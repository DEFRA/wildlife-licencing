describe('application-licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('getData', () => {
    it('looks-up the application and applicant and performs the necessary transformation', async () => {
      const mockGetData = jest.fn(() => ({
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
      }))

      const mockSetData = jest.fn()

      const request = {
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        }),
        query: { applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }
      }

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          SITE: {
            findByApplicationId: jest.fn(() => [{
              id: '11de2969-91d4-48d6-a5fe-d828a244aa18',
              name: 'Site 1',
              address: {
                subBuildingName: 'site street',
                buildingName: 'jubilee',
                buildingNumber: '123',
                street: 'site street',
                town: 'Peckham',
                county: 'kent',
                postcode: 'SW1W 0NY',
                xCoordinate: '123567',
                yCoordinate: '145345'
              }
            }])
          },
          APPLICATION: {
            getById: jest.fn(() => ({
              id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
              applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
            }))
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                fullName: 'Joe Blogs'
              }))
            })
          },
          LICENCES: {
            findByApplicationId: jest.fn(() => [{
              id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
              applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
              endDate: '2022-08-26',
              startDate: '2022-08-10',
              licenceNumber: 'LI-0016N0Z4'
            }])
          }
        }
      }))

      const { getData } = await import('../application-licence.js')
      const result = await getData(request)
      expect(result).toStrictEqual({
        applicant: {
          fullName: 'Joe Blogs'
        },
        application: {
          applicationType: 'A24',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
          id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
          siteAddress: 'site street, jubilee, 123, site street, Peckham, kent, SW1W 0NY'
        },
        licences: [{
          applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
          endDate: '26 August 2022',
          id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
          lastSent: null,
          licenceNumber: 'LI-0016N0Z4',
          startDate: '10 August 2022'
        }],
        statuses: {
          1: 'RECEIVED',
          100000000: 'AWAITING_ALLOCATION',
          100000001: 'ALLOCATED_FOR_ASSESSMENT',
          100000002: 'UNDER_ASSESSMENT',
          100000004: 'GRANTED',
          100000005: 'PAUSED',
          100000006: 'WITHDRAWN',
          100000008: 'NOT_GRANTED',
          452120001: 'EXPIRED_ROA_DUE',
          452120003: 'EXPIRED_ROA_RECEIVED',
          452120004: 'EXPIRED_ROA_RECEIVED_LATE'
        },
        lastSentEventFlag: null
      })
    })

    it('looks-up the application and applicant and performs the necessary licence expiry and site address transformation', async () => {
      const mockGetData = jest.fn(() => ({
        userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b'
      }))

      const mockSetData = jest.fn()

      const request = {
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        }),
        query: { applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }
      }

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          SITE: {
            findByApplicationId: jest.fn(() => [])
          },
          APPLICATION: {
            getById: jest.fn(() => ({
              id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
              applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b'
            }))
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                fullName: 'Dame Barking'
              }))
            })
          },
          LICENCES: {
            findByApplicationId: jest.fn(() => [{
              id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
              applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
              endDate: '2022-08-26',
              startDate: '2022-08-10',
              licenceNumber: 'LI-0016N0Z4',
              annotations: [
                {
                  objectTypeCode: 'sdds_license',
                  mimetype: 'application/pdf',
                  filename: 'LI-0016N0Z4 document.pdf',
                  endDate: '2022-08-26',
                  startDate: '2022-08-10'
                }
              ]
            }])
          }
        }
      }))

      const { getData } = await import('../application-licence.js')
      const result = await getData(request)
      expect(result).toStrictEqual({
        applicant: {
          fullName: 'Dame Barking'
        },
        application: {
          applicationType: 'A24',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
          id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
          siteAddress: ''
        },
        licences: [{
          applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
          endDate: '26 August 2022',
          id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
          lastSent: null,
          licenceNumber: 'LI-0016N0Z4',
          startDate: '10 August 2022',
          annotations: [
            {
              objectTypeCode: 'sdds_license',
              mimetype: 'application/pdf',
              filename: 'LI-0016N0Z4 document.pdf',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }
          ]
        }],
        statuses: {
          1: 'RECEIVED',
          100000000: 'AWAITING_ALLOCATION',
          100000001: 'ALLOCATED_FOR_ASSESSMENT',
          100000002: 'UNDER_ASSESSMENT',
          100000004: 'GRANTED',
          100000005: 'PAUSED',
          100000006: 'WITHDRAWN',
          100000008: 'NOT_GRANTED',
          452120001: 'EXPIRED_ROA_DUE',
          452120003: 'EXPIRED_ROA_RECEIVED',
          452120004: 'EXPIRED_ROA_RECEIVED_LATE'
        },
        lastSentEventFlag: {
          objectTypeCode: 'sdds_license',
          mimetype: 'application/pdf',
          filename: 'LI-0016N0Z4 document.pdf',
          endDate: '2022-08-26',
          startDate: '2022-08-10'
        }
      })
    })
  })

  describe('completion', () => {
    it('should request the queue of licence email resend and redirect to the email confirmation page', async () => {
      const mockQueueTheLicenceEmailResend = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' })
        }),
        payload: { 'email-or-return': 'email' }
      }

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            queueTheLicenceEmailResend: mockQueueTheLicenceEmailResend
          }
        }
      }))

      const { completion } = await import('../application-licence.js')
      await completion(request)
      expect(await completion(request)).toBe('/email-confirmation')
      expect(mockQueueTheLicenceEmailResend).toHaveBeenCalledWith('94de2969-91d4-48d6-a5fe-d828a244aa18')
    })

    it('should redirect to the the first page of the returns page with out queuing the email confirmation', async () => {
      const mockQueueTheLicenceEmailResend = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' })
        }),
        payload: { 'email-or-return': 'return' }
      }

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            queueTheLicenceEmailResend: mockQueueTheLicenceEmailResend
          }
        }
      }))

      const { completion } = await import('../application-licence.js')
      await completion(request)
      expect(await completion(request)).toBe('/licensed-actions')
      expect(mockQueueTheLicenceEmailResend).not.toHaveBeenCalled()
    })
  })

  describe('validator', () => {
    it('should return an error you have not selected an option', async () => {
      try {
        const payload = { 'email-or-return': '' }
        const context = {
          context: {
            query: {
            }
          }
        }
        jest.doMock('../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
                })
              }
            }
          }
        })

        jest.doMock('../../../services/api-requests.js', () => ({
          APIRequests: {
            LICENCES: {
              findByApplicationId: jest.fn(() => [{
                id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
                applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
                endDate: '2022-08-26',
                startDate: '2022-08-10',
                licenceNumber: 'LI-0016N0Z4',
                annotations: [
                  {
                    objectTypeCode: 'sdds_license',
                    mimetype: 'application/pdf',
                    filename: 'LI-0016N0Z4 document.pdf',
                    endDate: '2022-08-26',
                    startDate: '2022-08-10'
                  }
                ]
              }])
            }
          }
        }))
        const { validator } = await import('../application-licence.js')
        expect(await validator(payload, context))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should return null when there is no error', async () => {
      const payload = { 'email-or-return': 'email' }
      const context = {
        context: {
          query: {
          }
        }
      }
      jest.doMock('../../../session-cache/cache-decorator.js', () => {
        return {
          cacheDirect: () => {
            return {
              getData: () => ({
                applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
              })
            }
          }
        }
      })
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => [{
              id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
              applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
              endDate: '2022-08-26',
              startDate: '2022-08-10',
              licenceNumber: 'LI-0016N0Z4',
              annotations: [
                {
                  objectTypeCode: 'sdds_license',
                  mimetype: 'application/pdf',
                  filename: 'LI-0016N0Z4 document.pdf',
                  endDate: '2022-08-26',
                  startDate: '2022-08-10'
                }
              ]
            }])
          }
        }
      }))
      const { validator } = await import('../application-licence.js')
      expect(await validator(payload, context)).toBeUndefined()
    })
  })
})
