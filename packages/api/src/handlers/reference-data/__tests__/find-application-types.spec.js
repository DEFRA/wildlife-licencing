jest.spyOn(console, 'error').mockImplementation(() => null)

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

describe('The find-application-types data handlers', () => {
  beforeEach(() => jest.resetModules())

  it('returns application-types from the databases', async () => {
    const mockQuery = jest.fn(() => [
      {
        applicationTypeIds: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
        applicationPurposeIds: '3db073af-201b-ec11-b6e7-0022481a8f18',
        speciesIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectIds: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        activityIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        methods: '100000010'
      },
      {
        applicationTypeIds: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
        applicationPurposeIds: '3db073af-201b-ec11-b6e7-0022481a8f18',
        speciesIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectIds: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        activityIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        methods: '100000011'
      }
    ])

    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: { restore: () => null, save: mockSave }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))

    const { findApplicationTypes } = await import(
      '../find-application-types.js'
    )
    const query = {
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'], // Development
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'], // Badger
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      activities: ['68855554-59ed-ec11-bb3c-000d3a0cee24'], // Interfere with badger set
      methods: ['100000010', '100000011']
    }
    await findApplicationTypes(
      {},
      { path: '/path', query: { query: JSON.stringify(query) } },
      h
    )
    expect(h.response).toHaveBeenCalledWith({
      activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      methods: ['100000010', '100000011'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith(
      '/path?query=%7B%22purposes%22%3A%5B%223db073af-201b-ec11-b6e7-0022481a8f18%22%5D%2C%22species%22%3A%5B%22fedb14b6-53a8-ec11-9840-0022481aca85%22%5D%2C%22speciesSubjects%22%3A%5B%2260ce79d8-87fb-ec11-82e5-002248c5c45b%22%5D%2C%22activities%22%3A%5B%2268855554-59ed-ec11-bb3c-000d3a0cee24%22%5D%2C%22methods%22%3A%5B%22100000010%22%2C%22100000011%22%5D%7D',
      {
        activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
        methods: ['100000010', '100000011'],
        purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
        species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
        speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
        types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
      }
    )
  })

  it('returns application-types from the databases - no parameters', async () => {
    const mockQuery = jest.fn(() => [
      {
        applicationTypeIds: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
        applicationPurposeIds: '3db073af-201b-ec11-b6e7-0022481a8f18',
        speciesIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectIds: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        activityIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        methods: '100000010'
      },
      {
        applicationTypeIds: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
        applicationPurposeIds: '3db073af-201b-ec11-b6e7-0022481a8f18',
        speciesIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        speciesSubjectIds: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
        activityIds: 'fedb14b6-53a8-ec11-9840-0022481aca85',
        methods: '100000011'
      }
    ])

    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: { restore: () => null, save: mockSave }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))

    const { findApplicationTypes } = await import(
      '../find-application-types.js'
    )
    const query = {}
    await findApplicationTypes(
      {},
      { path: '/path', query: { query: JSON.stringify(query) } },
      h
    )
    expect(h.response).toHaveBeenCalledWith({
      activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      methods: ['100000010', '100000011'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith('/path?query=%7B%7D', {
      activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      methods: ['100000010', '100000011'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
    })
  })

  it('returns application-types from the cache', async () => {
    const mockRestore = jest.fn(() =>
      JSON.stringify({
        activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
        methods: ['100000010', '100000011'],
        purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
        species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
        speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
        types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
      })
    )

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: { restore: mockRestore }
      }
    }))

    const query = {
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'], // Development
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'], // Badger
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      activities: ['68855554-59ed-ec11-bb3c-000d3a0cee24'], // Interfere with badger set
      methods: ['100000010', '100000011']
    }
    const { findApplicationTypes } = await import(
      '../find-application-types.js'
    )
    await findApplicationTypes(
      {},
      { path: '/path', query: { query: JSON.stringify(query) } },
      h
    )
    expect(h.response).toHaveBeenCalledWith({
      activities: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      methods: ['100000010', '100000011'],
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'],
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'],
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      types: ['9d62e5b8-9c77-ec11-8d21-000d3a87431b']
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws with error', async () => {
    const mockRestore = jest.fn(() => {
      throw new Error()
    })

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: { restore: mockRestore }
      }
    }))

    const query = {
      purposes: ['3db073af-201b-ec11-b6e7-0022481a8f18'], // Development
      species: ['fedb14b6-53a8-ec11-9840-0022481aca85'], // Badger
      speciesSubjects: ['60ce79d8-87fb-ec11-82e5-002248c5c45b'],
      activities: ['68855554-59ed-ec11-bb3c-000d3a0cee24'], // Interfere with badger set
      methods: ['100000010', '100000011']
    }
    const { findApplicationTypes } = await import(
      '../find-application-types.js'
    )
    await expect(async () => {
      await findApplicationTypes(
        {},
        { path: '/path', query: { query: JSON.stringify(query) } },
        h
      )
    }).rejects.toThrow()
  })
})
