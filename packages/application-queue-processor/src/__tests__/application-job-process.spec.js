jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { APPLICATION_QUEUE: {} }
}))

const job = {
  data: {
    applicationId: '593c29d4-876b-4662-8614-619f008c8c38'
  }
}

describe('The application job processor', () => {
  beforeEach(() => jest.resetModules())
  it('returns resolve for a completed job', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')

    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => ({ dataValues: { application: { foo: 'bar' } } })),
      update: jest.fn()
    }

    const mockBatchUpdate = jest.fn()

    jest.doMock('@defra/wls-powerapps-lib', () => {
      const originalModule = jest.requireActual('@defra/wls-powerapps-lib')
      return {
        batchUpdate: mockBatchUpdate,
        UnRecoverableBatchError: originalModule.UnRecoverableBatchError
      }
    })
    const { applicationJobProcess } = await import('../application-job-process.js')
    await applicationJobProcess(job)

    expect(mockBatchUpdate).toHaveBeenCalledWith({ foo: 'bar' })

    expect(models.applications.update)
      .toHaveBeenCalledWith({
        submitted: expect.anything()
      }, {
        where: {
          id: job.data.applicationId
        }
      })
  })

  it('returns resolve for an application not found in the database', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => null)
    }
    const { applicationJobProcess } = await import('../application-job-process.js')
    await expect(applicationJobProcess(job)).resolves.not.toBeDefined()
  })

  it('resolves for the POWERAPPS interface returning an un-recoverable error', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')

    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => ({ dataValues: { application: { foo: 'bar' } } })),
      update: jest.fn()
    }

    const originalModule = jest.requireActual('@defra/wls-powerapps-lib')
    const UnRecoverableBatchError = originalModule.UnRecoverableBatchError
    const mockBatchUpdate = jest.fn(() => { throw new UnRecoverableBatchError() })

    jest.doMock('@defra/wls-powerapps-lib', () => {
      return {
        batchUpdate: mockBatchUpdate,
        UnRecoverableBatchError
      }
    })
    const { applicationJobProcess } = await import('../application-job-process.js')
    await expect(applicationJobProcess(job)).resolves.not.toBeDefined()
  })

  it('rejects for the POWERAPPS interface returning a recoverable error', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')

    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => ({ dataValues: { application: { foo: 'bar' } } })),
      update: jest.fn()
    }

    const originalModule = jest.requireActual('@defra/wls-powerapps-lib')
    const RecoverableBatchError = originalModule.RecoverableBatchError
    const UnRecoverableBatchError = originalModule.UnRecoverableBatchError
    const mockBatchUpdate = jest.fn(() => { throw new RecoverableBatchError('err') })

    jest.doMock('@defra/wls-powerapps-lib', () => {
      return {
        batchUpdate: mockBatchUpdate,
        RecoverableBatchError,
        UnRecoverableBatchError
      }
    })
    const { applicationJobProcess } = await import('../application-job-process.js')
    await expect(applicationJobProcess(job)).rejects.toEqual(new Error('err'))
  })
})
