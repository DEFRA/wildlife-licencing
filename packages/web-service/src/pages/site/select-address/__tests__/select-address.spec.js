import path from 'path'
import { compileTemplate } from '../../../../initialise-snapshot-tests.js'

describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = {
      siteData: { postcode: 'B15 7GF' },
      addressLookup: [{ Address: { town: 'Bristol' } }]
    }
    const request = {
      cache: () => ({
        getData: () => result
      })
    }

    const { getData } = await import('../select-address.js')
    expect(await getData(request)).toStrictEqual({
      postcode: 'B15 7GF',
      uri: { addressForm: '/site-address-no-lookup', postcode: '/site-got-postcode' },
      addressLookup: [{ Address: { town: 'Bristol' } }]
    })
  })

  it('setData with site info', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return [{ id: '6829ad54', name: 'site-name' }]
          }
        }
      }
    }))
    const { setData } = await import('../select-address.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '739f4e35',
          addressLookup: [{ Address: { UPRN: '123', Street: 'VICARAGE ROAD', Postcode: 'SW1W 0NY' } }],
          siteData: { id: '6829ad54', name: 'site-name' }
        })),
        setData: mockSetData
      }),
      payload: {
        uprn: 123
      }
    }

    await setData(request)

    expect(mockSetData).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith('6829ad54', { id: '6829ad54', address: { postcode: 'SW1W 0NY', street: 'VICARAGE ROAD', uprn: '123' }, name: 'site-name' })
  })

  it('setData with no site info', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return []
          }
        }
      }
    }))
    const { setData } = await import('../select-address.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '739f4e35',
          addressLookup: [{ Address: { UPRN: '123', Street: 'VICARAGE ROAD', Postcode: 'SW1W 0NY' } }],
          siteData: { id: '6829ad54', name: 'site-name' }
        })),
        setData: mockSetData
      }),
      payload: {
        uprn: 123
      }
    }

    await setData(request)

    expect(mockSetData).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith(undefined, { address: { postcode: 'SW1W 0NY', street: 'VICARAGE ROAD', uprn: '123' } })
  })

  it('should redirect user to the site map upload page, when the site tag is in progress', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'IN_PROGRESS'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => true }
          }
        }
      }
    }))
    const { completion } = await import('../select-address.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: { postcode: 'B15 7GF' },
          addressLookup: [{ Address: { town: 'Bristol' } }]
        })
      })
    }
    expect(await completion(request)).toBe('/upload-survey-map')
  })

  it('should redirect user to check site answers page, when the tag is complete', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: jest.fn(() => 'complete') }
          }
        }
      }
    }))
    const { completion } = await import('../select-address.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: { postcode: 'B15 7GF' },
          addressLookup: [{ Address: { town: 'Bristol' } }]
        })
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })
})

describe('site-got-postcode page template', () => {
  it('Matches the snapshot', async () => {
    const template = await compileTemplate(path.join(__dirname, '../select-address.njk'))

    const renderedHtml = template.render({
      data: {}
    })

    expect(renderedHtml).toMatchSnapshot()
  })
})
