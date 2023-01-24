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
        null: {
          name: 'type name',
          description: 'type-desc'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_applicationtypeses',
        powerAppsKey: '00171fc3-a556-ec11-8f8f-000d3a0ce11e'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
      json: {
        description: 'type-desc',
        name: 'type name'
      }
    })

    expect(result).toEqual({ update: 1 })
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
        null: {
          name: 'purpose name',
          description: 'purpose-desc'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_applicationpurposes',
        powerAppsKey: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        description: 'purpose-desc',
        name: 'purpose name'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('performs an upsert on the option sets', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.optionSets = {
      upsert: mockUpsert
    }

    const { writeOptionSets } = await import('../write-object.js')
    const result = await writeOptionSets({
      name: 'name',
      values: { foo: 'bar' }
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      name: 'name',
      json: {
        foo: 'bar'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('performs an upsert on activities', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.activities = {
      upsert: mockUpsert
    }

    const { writeActivities } = await import('../write-object.js')
    const result = await writeActivities({
      data: {
        null: {
          name: 'activity name',
          description: 'activity-desc'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_licenseactivities',
        powerAppsKey: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        name: 'activity name'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('performs an upsert on methods', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.methods = {
      upsert: mockUpsert
    }

    const { writeMethods } = await import('../write-object.js')
    const result = await writeMethods({
      data: {
        null: {
          option: 123,
          name: 'method name',
          description: 'method-desc'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_licensemethods',
        powerAppsKey: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      option: 123,
      json: {
        name: 'method name'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('performs an upsert on species', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.species = {
      upsert: mockUpsert
    }

    const { writeSpecies } = await import('../write-object.js')
    const result = await writeSpecies({
      data: {
        null: {
          name: 'species name',
          description: 'species-desc'
        }
      },
      keys: [{
        apiTable: 'species',
        powerAppsKey: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      },
      {
        apiTable: 'speciesSubject',
        powerAppsKey: '8add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      species_subject_id: '8add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        name: 'species name',
        description: 'species-desc'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('performs an upsert on species-subject', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpsert = jest.fn(() => [{}, false])

    models.speciesSubject = {
      upsert: mockUpsert
    }

    const { writeSpeciesSubject } = await import('../write-object.js')
    const result = await writeSpeciesSubject({
      data: {
        null: {
          name: 'species-subject name',
          description: 'species-subject-desc'
        }
      },
      keys: [{
        powerAppsTable: 'sdds_speciesubjects',
        powerAppsKey: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a'
      }]
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      id: '9add5ba9-3f60-42cb-aaf9-0999923a5e2a',
      json: {
        name: 'species-subject name'
      }
    })
    expect(result).toEqual({ update: 1 })
  })

  it('maintain activity-methods', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockSet = jest.fn()
    models.activities = {
      findOne: jest.fn(() => ({
        id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2',
        setMethods: mockSet,
        countMethods: jest.fn(() => 2)
      }))
    }
    models.methods = {
      findAll: jest.fn(() => [
        { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
        { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }
      ])
    }

    const { writeActivityMethods } = await import('../write-object.js')

    const result = await writeActivityMethods({
      keys: [
        { apiTable: 'activities', powerAppsKey: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'methods', powerAppsKey: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'methods', powerAppsKey: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }
      ]
    })

    expect(mockSet).toHaveBeenCalledWith([
      { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
      { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }])

    expect(result).toEqual({ update: 2 })
  })

  it('maintain application-type activities', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockSet = jest.fn()
    models.applicationTypes = {
      findOne: jest.fn(() => ({
        id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2',
        setActivities: mockSet,
        countActivities: jest.fn(() => 2)
      }))
    }
    models.activities = {
      findAll: jest.fn(() => [
        { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
        { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }
      ])
    }

    const { writeApplicationTypeActivities } = await import('../write-object.js')

    const result = await writeApplicationTypeActivities({
      keys: [
        { apiTable: 'applicationTypes', powerAppsKey: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'activities', powerAppsKey: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'activities', powerAppsKey: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }
      ]
    })

    expect(mockSet).toHaveBeenCalledWith([
      { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
      { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }])

    expect(result).toEqual({ update: 2 })
  })

  it('maintain application-type species', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockSet = jest.fn()
    models.applicationTypes = {
      findOne: jest.fn(() => ({
        id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2',
        setSpecies: mockSet,
        countSpecies: jest.fn(() => 2)
      }))
    }
    models.species = {
      findAll: jest.fn(() => [
        { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
        { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }
      ])
    }

    const { writeApplicationTypeSpecies } = await import('../write-object.js')

    const result = await writeApplicationTypeSpecies({
      keys: [
        { apiTable: 'applicationTypes', powerAppsKey: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'species', powerAppsKey: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'species', powerAppsKey: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }
      ]
    })

    expect(mockSet).toHaveBeenCalledWith([
      { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
      { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }])

    expect(result).toEqual({ update: 2 })
  })

  it('maintain application-type purposes', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockSet = jest.fn()
    models.applicationTypes = {
      findOne: jest.fn(() => ({
        id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2',
        'setApplication-purposes': mockSet,
        'countApplication-purposes': jest.fn(() => 2)
      }))
    }
    models.applicationPurposes = {
      findAll: jest.fn(() => [
        { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
        { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }
      ])
    }

    const { writeApplicationApplicationPurpose } = await import('../write-object.js')

    const result = await writeApplicationApplicationPurpose({
      keys: [
        { apiTable: 'applicationTypes', powerAppsKey: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'applicationPurposes', powerAppsKey: '4a0fd3af-cd68-43ac-a0b4-123b79aaa83b' },
        { apiTable: 'applicationPurposes', powerAppsKey: '5a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }
      ]
    })

    expect(mockSet).toHaveBeenCalledWith([
      { id: '6e48a6f4-5a27-475d-bd83-561c6e0e80d2' },
      { id: '1e48a6f4-5a27-475d-bd83-561c6e0e80d2' }])

    expect(result).toEqual({ update: 2 })
  })
})
