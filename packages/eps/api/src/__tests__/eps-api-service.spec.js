describe('The wrapper: eps-api-service', () => {
  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('../services/secrets.js')
        const { fetchSecrets } = require('../services/secrets.js')
        const { createServer, init } = require('../server.js')
        fetchSecrets.mockImplementation(() => Promise.resolve())
        createServer.mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.resolve())
        require('../eps-api-service')
        setImmediate(() => {
          expect(fetchSecrets).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(init).toHaveBeenCalled()
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })

  it('has initialisation failure', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('../services/secrets.js')
        const { fetchSecrets } = require('../services/secrets.js')
        const { createServer, init } = require('../server.js')
        createServer.mockImplementation(() => Promise.resolve())
        fetchSecrets.mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.reject(new Error()))
        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../eps-api-service')
        setImmediate(() => {
          expect(fetchSecrets).toHaveBeenCalled()
          expect(init).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
