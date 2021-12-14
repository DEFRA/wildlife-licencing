import { applicationJobProcess } from '../application-job-process.js'

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
  it('returns resolve for a completed job', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')

    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => ({ foo: 'bar' })),
      update: jest.fn()
    }
    await applicationJobProcess(job)
    expect(models.applications.update)
      .toHaveBeenCalledWith({
        submitted: expect.anything()
      }, {
        where: {
          id: job.data.applicationId
        }
      })
  })

  it('returns resolve on an unrecoverable error - no application', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => null)
    }
    await expect(applicationJobProcess(job)).resolves.not.toBeDefined()
  })

  it('returns reject on a recoverable error - throws', async () => {
    const { models } = await import('@defra/wls-database-model')
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    SEQUELIZE.getSequelize = jest.fn(() => ({
      fn: jest.fn(() => ({ foo: 'bar' }))
    }))

    models.applications = {
      findByPk: jest.fn(() => { throw new Error('err') })
    }
    await expect(applicationJobProcess(job)).rejects.toThrowError('err')
  })
})
