describe('The check site answers page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const result = {
      siteData: {
        id: '12345',
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
        },
        name: 'site-name',
        gridReference: 'NY123456',
        siteMapFiles: {
          activity: 'site.pdf',
          mitigationsDuringDevelopment: 'demo.jpg',
          mitigationsAfterDevelopment: 'site-after-development.shape'
        }
      }
    }

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          getSiteById: () => {
            return result.siteData
          },
          findByApplicationId: () => {
            return [result]
          }
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: () => {
          return result
        }
      })
    }

    const { getData } = await import('../check-site-answers.js')
    expect(await getData(request)).toStrictEqual(
      [
        { key: 'siteName', value: 'site-name' },
        { key: 'siteAddress', value: 'site street, jubilee, 123, site street, Peckham, kent, SW1W 0NY' },
        { key: 'siteMap', value: 'site.pdf' },
        { key: 'siteMapTwo', value: 'demo.jpg' },
        { key: 'siteMapThree', value: 'site-after-development.shape' },
        { key: 'siteGridReference', value: 'NY123456' }
      ]
    )
  })

  it('should return null from checkData, when there is an application id', async () => {
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { checkData } = await import('../check-site-answers.js')
    expect(await checkData(request)).toBeNull()
  })

  it('checkData', async () => {
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({})
      })
    }
    const { checkData } = await import('../check-site-answers.js')
    const mockRedirect = jest.fn(() => '/applications')
    const result = await checkData(request, { redirect: () => mockRedirect })
    expect(result()).toEqual('/applications')
  })

  it('completion', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: jest.fn(() => 'complete') }
          }
        }
      }
    }))

    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '123456789'
        })
      })
    }
    const { completion } = await import('../check-site-answers.js')
    expect(await completion(request)).toEqual('/tasklist')
  })
})
