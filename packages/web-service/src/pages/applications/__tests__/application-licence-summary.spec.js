import { compileTemplate } from '../../../initialise-snapshot-tests'
import path from 'path'

describe('application-licence page', () => {
  beforeEach(() => jest.resetModules())

  const testData = {
    applicant: {
      fullName: 'Joe Blogs'
    },
    application: {
      applicationType: 'A24',
      applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
      id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
      siteAddress: 'site street,<br>jubilee,<br>123,<br>site street,<br>Peckham,<br>kent,<br>SW1W 0NY'
    },
    applicationLicence: {
      applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
      endDate: '26 August 2022',
      id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
      lastSent: '9 June 2023',
      licenceNumber: 'LI-0016N0Z4',
      startDate: '10 August 2022',
      annotations: [
        {
          filename: '2023-1253092-WLM-LIC-licence document.pdf',
          mimetype: 'application/pdf',
          modifiedOn: '2023-06-09T16:09:06Z',
          objectTypeCode: 'sdds_license'
        }
      ]
    },
    lastLicenceReturn: {
      createdAtFormatted: null,
      id: '1'
    },
    licenceStatuses: {
      1: 'ACTIVE',
      100000000: 'DRAFT',
      452120001: 'EXPIRED_ROA_DUE',
      452120002: 'GRANTED_ROA_RECEIVED',
      452120003: 'EXPIRED_ROA_RECEIVED',
      452120004: 'EXPIRED_ROA_RECEIVED_LATE'
    },
    lastSentEventFlag: true
  }

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
        query: {
          applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
          licenceId: '7eabe3f9-8818-ed11-b83e-002248c5c45b'
        }
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
              licenceNumber: 'LI-0016N0Z4',
              annotations: [{ filename: '2023-1253092-WLM-LIC-licence document.pdf', mimetype: 'application/pdf', modifiedOn: '2023-06-09T16:09:06Z', objectTypeCode: 'sdds_license' }]
            }])
          },
          RETURNS: {
            getLastLicenceReturn: jest.fn(() => ({
              id: '1'
            }))
          }
        }
      }))

      const { getData } = await import('../application-licence-summary.js')
      const result = await getData(request)
      expect(result).toStrictEqual(testData)
    })
  })

  describe('application-licence-summary page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../application-licence-summary.njk'))

      const renderedHtml = template.render({
        data: testData
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('completion', () => {
    it('should request the queue of licence email resend and redirect to the email-confirmation page', async () => {
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

      const { completion } = await import('../application-licence-summary.js')
      await completion(request)
      expect(mockQueueTheLicenceEmailResend).toHaveBeenCalledWith('94de2969-91d4-48d6-a5fe-d828a244aa18')
      expect(await completion(request)).toBe('/email-confirmation')
    })

    it('should redirect to the did-you-carry-out-licensed-actions page', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }),
          setData: mockSetData
        }),
        payload: { 'email-or-return': 'return' }
      }

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '123-AbEF-67',
              licenceNumber: '2023-500000-SPM-LIC'
            }]))
          }
        }
      }))

      const { completion } = await import('../application-licence-summary.js')
      expect(await completion(request)).toBe('/did-you-carry-out-licensed-actions')
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18', licenceId: '123-AbEF-67', licenceNumber: '2023-500000-SPM-LIC' })
    })

    it('should redirect to the applications page when the user does not select to email a copy of a licence or submit a return', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18' }),
          setData: jest.fn()
        }),
        payload: { }
      }

      const { completion } = await import('../application-licence-summary.js')
      expect(await completion(request)).toBe('/applications')
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
                  applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
                  lastSentEventFlag: true
                })
              }
            }
          }
        })

        const { validator } = await import('../application-licence-summary.js')
        expect(await validator(payload, context))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should return null there are no events', async () => {
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
                applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
                lastSentEventFlag: false
              })
            }
          }
        }
      })

      const { validator } = await import('../application-licence-summary.js')

      expect(await validator(payload, context)).toBeUndefined()
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
                applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18',
                lastSentEventFlag: true
              })
            }
          }
        }
      })
      const { validator } = await import('../application-licence-summary.js')
      expect(await validator(payload, context)).toBeUndefined()
    })
  })
})
