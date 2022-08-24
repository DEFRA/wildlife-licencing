
const results = {
  header: {
    uri: null,
    query: 'postcode=BS8 2QA',
    offset: 0,
    totalresults: 1,
    format: 'JSON',
    dataset: 'DPA',
    lr: 'EN',
    maxresults: 100
  },
  results: [
    {
      address: {
        addressLine: 'SOME COMPANY, 67, WHITELADIES ROAD, BRISTOL, BS8 2QA',
        subBuildingName: 'SOME COMPANY',
        buildingName: null,
        buildingNumber: '66',
        street: 'WHITELADIES ROAD',
        locality: null,
        dependentLocality: null,
        town: 'BRISTOL',
        county: null,
        postcode: 'BS8 2QA',
        country: 'ENGLAND',
        xCoordinate: 357649.0,
        yCoordinate: 174256.0,
        uprn: '177422',
        match: 1.0,
        matchDescription: 'EXACT',
        language: 'EN'
      }
    }
  ]
}

describe('The address-lookup connector', () => {
  beforeEach(() => jest.resetModules())

  it('correctly performs a successful address lookup request', async () => {
    jest.doMock('../config.js', () => ({
      address: {
        url: 'https://address',
        certificatePath: '/cert',
        passphrase: 'pass',
        timeout: 20000
      }
    }))
    jest.doMock('fs')
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => JSON.stringify(results),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { ADDRESS } = await import('../address-lookup.js')
    const response = await ADDRESS.lookup('BS8 2QA')
    expect(response).toEqual(JSON.stringify(results))
    expect(mockFetch).toHaveBeenCalledWith('https://address/?postcode=BS8+2QA', expect.objectContaining({ method: 'GET' }))
  })
})
