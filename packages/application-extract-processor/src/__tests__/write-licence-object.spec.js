const data = {
  licence: {
    startDate: '2022-08-10T00:00:00Z',
    endDate: '2022-08-26T00:00:00Z',
    licenceNumber: 'LI-0016N0Z4'
  }
}

const keys = [{
  apiTable: 'licences',
  apiKey: null,
  apiBasePath: 'licence',
  powerAppsTable: 'sdds_licenses',
  powerAppsKey: '7eabe3f9-8818-ed11-b83e-002248c5c45b'
},
{
  apiTable: 'applications',
  apiKey: null,
  apiBasePath: 'licence.applicationId',
  powerAppsTable: 'sdds_applications',
  powerAppsKey: '1c9362f0-8418-ed11-b83e-002248c5c45b'
}]

describe('The licence extract processor: write-licence-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found licence with different data', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })) },
        licences: {
          findOne: jest.fn(() => ({
            id: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            licence: {}
          })),
          update: mockUpdate
        }
      }
    }))
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
    expect(mockUpdate).toHaveBeenCalledWith({
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
      licence: {
        endDate: '2022-08-26T00:00:00Z',
        licenceNumber: 'LI-0016N0Z4',
        startDate: '2022-08-10T00:00:00Z'
      }
    }, { returning: false, where: { id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' } })
  })

  it('does nothing on a found licence with identical data', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })) },
        licences: {
          findOne: jest.fn(() => ({
            id: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            licence: data.licence
          })),
          update: mockUpdate
        }
      }
    }))
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing on a where there is no application found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => null) }
      }
    }))
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing on a where there is no application key in the stream', async () => {
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys: [keys[0]] })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('makes an insert on a new licence', async () => {
    const mockCreate = jest.fn()
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: { findOne: jest.fn(() => ({ id: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })) },
        licences: {
          findOne: jest.fn(() => null),
          create: mockCreate
        }
      }
    }))
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
    expect(mockCreate).toHaveBeenCalledWith({
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
      id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
      licence: {
        endDate: '2022-08-26T00:00:00Z',
        licenceNumber: 'LI-0016N0Z4',
        startDate: '2022-08-10T00:00:00Z'
      }
    })
  })

  it('records an error on an exception', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      applications: { findOne: jest.fn(() => { throw new Error() }) }
    }))
    const { writeLicenceObject } = await import('../write-licence-object.js')
    const result = await writeLicenceObject({ data, keys })
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
