describe('The reference data extract processor: write-object', () => {
  beforeEach(() => jest.resetModules())
  it('performs an upsert on a application-types', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, true])

    models.applicationTypes = {
      upsert: mockUpsert
    }
    const { writeApplicationTypes } = await import('../write-object.js')
    const result = await writeApplicationTypes({
      data: {
        name: 'type name',
        description: 'type-desc'
      },
      keys: {
        sdds_applicationtypeses: {
          eid: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
        }
      }
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        description: 'type-desc',
        name: 'type name'
      }
    })

    expect(result).toEqual({ insert: 1, update: 0 })
  })

  it('performs an upsert on a application-purposes', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.applicationPurposes = {
      upsert: mockUpsert
    }

    const { writeApplicationPurposes } = await import('../write-object.js')
    const result = await writeApplicationPurposes({
      data: {
        name: 'purpose name',
        description: 'purpose-desc'
      },
      keys: {
        sdds_applicationpurposes: {
          eid: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
        }
      }
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        description: 'purpose-desc',
        name: 'purpose name'
      }
    })
    expect(result).toEqual({ insert: 0, update: 1 })
  })
})
