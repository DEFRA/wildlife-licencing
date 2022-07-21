
describe('The habitat site validate function', () => {
  beforeEach(() => jest.resetModules())

  it('Return error activity not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => null) },
        species: { findByPk: jest.fn(() => null) },
        methods: { findAll: jest.fn(() => []) }
      }
    }))
    const applicationType = null
    const activityId = 100
    const speciesId = null
    const methodIds = null
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'activityId: 100 not found' })
  })

  it('Return error species not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 101 })) },
        species: { findByPk: jest.fn(() => null) },
        methods: { findAll: jest.fn(() => []) }
      }
    }))
    const applicationType = null
    const activityId = 100
    const speciesId = 101
    const methodIds = null
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'speciesId: 101 not found' })
  })

  it('Return error methods not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100 })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => []) }
      }
    }))
    const applicationType = null
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'methodIds: 102, 103 not found' })
  })

  it('Return error if application type does not permit activity', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100 })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) }
      }
    }))
    const applicationType = { id: '104', hasActivity: jest.fn(() => false) }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid activity: 100 for application type: 104' })
  })

  it('Return error if application type does not permit species', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100 })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) }
      }
    }))
    const applicationType = {
      id: '104',
      hasActivity: jest.fn(() => true),
      hasSpecies: jest.fn(() => false)
    }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid species: 101 for application type: 104' })
  })

  it('Return error if activity type does not permit methods', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100, hasMethods: jest.fn(() => false) })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) }
      }
    }))
    const applicationType = {
      id: '104',
      hasActivity: jest.fn(() => true),
      hasSpecies: jest.fn(() => true)
    }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid methods: 102, 103 for activity: 100' })
  })

  it('Return error if the sett type is not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100, hasMethods: jest.fn(() => true) })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) },
        optionSets: { findByPk: jest.fn(() => ({ json: [105] })) }

      }
    }))
    const applicationType = {
      id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
      hasActivity: jest.fn(() => true),
      hasSpecies: jest.fn(() => true)
    }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = 104
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid settType: 104' })
  })

  it('Return error if the sett type is not set', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100, hasMethods: jest.fn(() => true) })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) },
        optionSets: { findByPk: jest.fn(() => ({ json: [105] })) }

      }
    }))
    const applicationType = {
      id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
      hasActivity: jest.fn(() => true),
      hasSpecies: jest.fn(() => true)
    }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid settType: null' })
  })

  it('Return null if no error found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        activities: { findByPk: jest.fn(() => ({ id: 100, hasMethods: jest.fn(() => true) })) },
        species: { findByPk: jest.fn(() => ({ id: 101 })) },
        methods: { findAll: jest.fn(() => [{ id: 102 }, { id: 103 }]) },
        optionSets: { findByPk: jest.fn(() => ({ json: [104] })) }
      }
    }))
    const applicationType = {
      id: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
      hasActivity: jest.fn(() => true),
      hasSpecies: jest.fn(() => true)
    }
    const activityId = 100
    const speciesId = 101
    const methodIds = [102, 103]
    const settType = null
    const { validateRelations } = await import('../validate-relations.js')
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    expect(err).toEqual({ description: 'Invalid settType: null' })
  })
})
