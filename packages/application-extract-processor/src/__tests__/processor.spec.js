describe('The application extract processor: processor', () => {
  afterAll(done => {
    jest.clearAllMocks()
    done()
  })

  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-powerapps-lib')
        jest.mock('../database-writer.js')

        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        const { createModels } = require('@defra/wls-database-model')
        const { applicationReadStream, sitesReadStream, applicationSitesReadStream } = require('@defra/wls-powerapps-lib')
        const { databaseWriter } = require('../database-writer.js')

        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        applicationReadStream.mockImplementation(() => ({}))
        sitesReadStream.mockImplementation(() => ({}))
        applicationSitesReadStream.mockImplementation(() => ({}))
        databaseWriter.mockImplementation(() => Promise.resolve())
        const mockExit = jest.fn()
        jest.spyOn(process, 'exit')
          .mockImplementation(code => mockExit(code))

        require('../processor.js')
        setImmediate(() => {
          expect(databaseWriter).toHaveBeenCalled()
          expect(mockExit).toHaveBeenCalledWith(0)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })

  it('exists on error', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-powerapps-lib')
        jest.mock('../database-writer.js')

        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        const { createModels } = require('@defra/wls-database-model')
        const { applicationReadStream, sitesReadStream, applicationSitesReadStream } = require('@defra/wls-powerapps-lib')
        const { databaseWriter } = require('../database-writer.js')

        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        applicationReadStream.mockImplementation(() => ({}))
        sitesReadStream.mockImplementation(() => ({}))
        applicationSitesReadStream.mockImplementation(() => ({}))
        databaseWriter.mockImplementation(() => Promise.reject(new Error()))
        const mockExit = jest.fn()
        jest.spyOn(process, 'exit')
          .mockImplementation(code => mockExit(code))

        require('../processor.js')
        setImmediate(() => {
          expect(databaseWriter).toHaveBeenCalled()
          expect(mockExit).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
