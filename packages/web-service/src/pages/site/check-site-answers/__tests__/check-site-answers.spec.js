describe('The check site answers page', () => {
  beforeEach(() => jest.resetModules())

  it('getData returns the correct data into the nunjucks page', async () => {
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
        APPLICATION: {
          tags: () => {
            return {
              set: jest.fn()
            }
          }
        },
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

  it('getData calls the set() tag function', async () => {
    const mockSet = jest.fn()
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
        NOT_STARTED: 'NOT_STARTED',
        COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: mockSet
            }
          }
        },
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
    await getData(request)
    expect(mockSet).toHaveBeenCalledWith({ tag: 'sites', tagState: 'complete-not-confirmed' })
  })

  it('completion', async () => {
    const mockSetData = jest.fn()
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
        }),
        setData: mockSetData
      })
    }
    const { completion } = await import('../check-site-answers.js')
    expect(await completion(request)).toEqual('/tasklist')
    expect(mockSetData).toHaveBeenCalled()
  })
})
