describe('application-summary page', () => {
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
              applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
              userSubmission: '2022-08-10T08:18:07.363Z'
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

      const { getData } = await import('../application-summary.js')
      const result = await getData(request)
      expect(result).toStrictEqual({
        applicant: {
          fullName: 'Joe Blogs'
        },
        application: {
          applicationType: 'A24',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
          id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
          siteAddress: 'site street,<br>jubilee,<br>123,<br>site street,<br>Peckham,<br>kent,<br>SW1W 0NY',
          userSubmission: '10 August 2022'
        },
        statuses: {
          1: 'RECEIVED',
          100000000: 'AWAITING_ALLOCATION',
          100000001: 'ALLOCATED_FOR_ASSESSMENT',
          100000002: 'UNDER_ASSESSMENT',
          100000004: 'GRANTED',
          100000005: 'PAUSED',
          100000008: 'NOT_GRANTED'
        }
      })
    })

    it('looks-up the application and applicant and performs the necessary transformation with out site address', async () => {
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
              applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
              userSubmission: '2022-08-10T08:18:07.363Z'
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

      const { getData } = await import('../application-summary.js')
      const result = await getData(request)
      expect(result).toStrictEqual({
        applicant: {
          fullName: 'Joe Blogs'
        },
        application: {
          applicationType: 'A24',
          applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
          id: '94de2969-91d4-48d6-a5fe-d828a244aa18',
          siteAddress: '',
          userSubmission: '10 August 2022'
        },
        statuses: {
          1: 'RECEIVED',
          100000000: 'AWAITING_ALLOCATION',
          100000001: 'ALLOCATED_FOR_ASSESSMENT',
          100000002: 'UNDER_ASSESSMENT',
          100000004: 'GRANTED',
          100000005: 'PAUSED',
          100000008: 'NOT_GRANTED'
        }
      })
    })
  })
})
