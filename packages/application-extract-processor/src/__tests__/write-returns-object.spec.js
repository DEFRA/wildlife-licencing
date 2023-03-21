jest.spyOn(console, 'error').mockImplementation(() => null)

const data = {
  return: {
    completedWithinLicenceDates: false,
    outcome: false,
    destroyVacantSettByMechanicalMeans: false
  }
}

const keys = [
  {
    apiTable: 'returns',
    apiKey: null,
    apiBasePath: 'return',
    powerAppsTable: 'sdds_returnofactions',
    contentId: null,
    powerAppsKey: 'd1e5a64f-9cb3-ed11-b596-0022481b53bf'
  },
  {
    apiTable: 'licences',
    apiKey: null,
    apiBasePath: 'return.licenceId',
    powerAppsTable: 'sdds_licenses',
    contentId: null,
    powerAppsKey: '38d3e4ea-ac06-ed11-82e4-002248c5c17e'
  }
]

describe('The returns extract processor: write-returns-object', () => {
  beforeEach(() => jest.resetModules())

  it('does nothing if no licence key found', async () => {
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data: {}, keys: [keys[0]] }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does nothing if the licence is not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.licences = {
      findOne: jest.fn(() => null)
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({
      data: {},
      keys: keys
    }, null)
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('creates a new return with the UNLOCKED flag set', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    models.licences = {
      findOne: jest.fn(() => ({ id: '38d3e4ea-ac06-ed11-82e4-002248c5c17e' }))
    }
    models.returns = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, null)
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      licenceId: '38d3e4ea-ac06-ed11-82e4-002248c5c17e',
      returnData: {
        completedWithinLicenceDates: false,
        destroyVacantSettByMechanicalMeans: false,
        outcome: false
      },
      sddsReturnId: 'd1e5a64f-9cb3-ed11-b596-0022481b53bf',
      updateStatus: 'U'
    })
    expect(result).toEqual({ error: 0, insert: 1, pending: 0, update: 0 })
  })

  it('makes an update on a found, pending return with a timestamp older than the extract start time, setting UNLOCKED', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.licences = {
      findOne: jest.fn(() => ({ id: '38d3e4ea-ac06-ed11-82e4-002248c5c17e' }))
    }
    models.returns = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1),
        returnData: data.return
      })),
      update: mockUpdate
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      returnData: {
        completedWithinLicenceDates: false,
        destroyVacantSettByMechanicalMeans: false,
        outcome: false
      },
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('makes an update on a found, unlocked permission, if data has changed, setting UNLOCKED', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.licences = {
      findOne: jest.fn(() => ({ id: '38d3e4ea-ac06-ed11-82e4-002248c5c17e' }))
    }
    models.returns = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2020, 0, 1),
        returnData: {
          completedWithinLicenceDates: true,
          outcome: false
        }
      })),
      update: mockUpdate
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, new Date())
    expect(mockUpdate).toHaveBeenCalledWith({
      returnData: data.return,
      updateStatus: 'U'
    }, { returning: false, where: { id: '9487013e-abf5-4f42-95fa-15ad404570a1' } })
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 1 })
  })

  it('ignores an update on a found, unlocked permission, if data has not changed', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.licences = {
      findOne: jest.fn(() => ({ id: '38d3e4ea-ac06-ed11-82e4-002248c5c17e' }))
    }
    models.returns = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: new Date(2020, 0, 1),
        returnData: data.return
      })),
      update: mockUpdate
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, new Date())
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('does not make an update on a found, pending permission with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    models.licences = {
      findOne: jest.fn(() => ({ id: '38d3e4ea-ac06-ed11-82e4-002248c5c17e' }))
    }
    models.returns = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: new Date(2022, 0, 2),
        returnData: {
          completedWithinLicenceDates: true,
          outcome: false
        }
      })),
      update: mockUpdate
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, new Date(2022, 0, 1))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ error: 0, insert: 0, pending: 0, update: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')
    models.licences = {
      findOne: jest.fn(() => { throw new Error() })
    }
    const { writeReturnObject } = await import('../write-return-object.js')
    const result = await writeReturnObject({ data, keys }, new Date())
    expect(result).toEqual({ error: 1, insert: 0, pending: 0, update: 0 })
  })
})
