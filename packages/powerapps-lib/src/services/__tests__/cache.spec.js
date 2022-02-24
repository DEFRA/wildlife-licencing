import { Readable } from 'stream'

describe('Reference data cache', () => {
  beforeEach(() => jest.resetModules())

  it('retrieve an application type data item by name from the cache', async () => {
    const mockGet = jest.fn(() => JSON.stringify([
      { id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' },
      { id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b', name: 'A24 Badger' }
    ]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        getClient: () => ({
          get: mockGet
        })
      }
    }))
    const { getReferenceDataIdByName } = await import('../cache.js')
    const result = await getReferenceDataIdByName('sdds_applicationtypeses', 'MIT BAT A045')
    expect(result).toBe('00171fc3-a556-ec11-8f8f-000d3a0ce11e')
  })

  it('retrieve an application type data item by id from the cache', async () => {
    const mockGet = jest.fn(() => JSON.stringify([
      { id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' },
      { id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b', name: 'A24 Badger' }
    ]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        getClient: () => ({
          get: mockGet
        })
      }
    }))
    const { getReferenceDataNameById } = await import('../cache.js')
    const result = await getReferenceDataNameById('sdds_applicationtypeses', '00171fc3-a556-ec11-8f8f-000d3a0ce11e')
    expect(result).toBe('MIT BAT A045')
  })

  it('return null where application type by name is not found', async () => {
    const mockGet = jest.fn(() => JSON.stringify([
      { id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' },
      { id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b', name: 'A24 Badger' }
    ]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        getClient: () => ({
          get: mockGet
        })
      }
    }))
    const { getReferenceDataIdByName } = await import('../cache.js')
    const result = await getReferenceDataIdByName('sdds_applicationtypeses', 'MIT RAT A045')
    expect(result).toBeNull()
  })

  it('return null where application type by id is not found', async () => {
    const mockGet = jest.fn(() => JSON.stringify([
      { id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' },
      { id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b', name: 'A24 Badger' }
    ]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        getClient: () => ({
          get: mockGet
        })
      }
    }))
    const { getReferenceDataNameById } = await import('../cache.js')
    const result = await getReferenceDataNameById('sdds_applicationtypeses', '00171fc3-a556-ec11-8f8f-000d3a0ce11f')
    expect(result).toBeNull()
  })

  it('build the cache when necessary', async () => {
    const mockSet = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        getClient: () => ({
          get: jest.fn().mockReturnValueOnce(null).mockReturnValueOnce([
            { id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' },
            { id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b', name: 'A24 Badger' }
          ]),
          set: mockSet
        })
      }
    }))

    const mockApplicationTypesReadStream = jest.fn(() => Readable.from([{
      data: {
        null: {
          name: 'MIT BAT A045',
          description: 'movements of bats'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_applicationtypeses',
        powerAppsKey: '00171fc3-a556-ec11-8f8f-000d3a0ce11e'
      }]
    }]
    ))

    const mockApplicationPurposesReadStream = jest.fn(() => Readable.from([]))

    jest.doMock('../../read-streams/read-streams.js', () => ({
      applicationTypesReadStream: mockApplicationTypesReadStream,
      applicationPurposesReadStream: mockApplicationPurposesReadStream
    }))

    const { getReferenceDataIdByName } = await import('../cache.js')
    const result = await getReferenceDataIdByName('sdds_applicationtypeses', 'MIT BAT A045')
    expect(result).toBe('00171fc3-a556-ec11-8f8f-000d3a0ce11e')
    expect(mockApplicationPurposesReadStream).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith(
      'ref-data-cache-sdds_applicationtypeses',
      JSON.stringify([{ id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e', name: 'MIT BAT A045' }]),
      { EX: 86400 })
  })
})
