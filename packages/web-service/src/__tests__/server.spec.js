import fs from 'fs'
jest.mock('@hapi/crumb', () => {
  return {
    plugin: {
      name: 'crumb',
      register: jest.fn().mockImplementation((server, options) => {
        // Mock implementation or behavior of crumb
      })
    }
  }
})
describe('the WEB server', () => {
  beforeEach(() => jest.resetModules())
  describe('the default header function', () => {
    it('adds a correct set of response headers - not static', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { addDefaultHeaders } = await import('../server.js')
      const mockHeader = jest.fn()
      const result = await addDefaultHeaders({
        path: 'not-static',
        response: {
          header: mockHeader
        }
      }, {
        continue: 'continue'
      })
      expect(result).toEqual('continue')
      expect(mockHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
      expect(mockHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(mockHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    })

    it('adds a correct set of response headers - static', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve() })
      }))
      const { addDefaultHeaders } = await import('../server.js')
      const mockHeader = jest.fn()
      const result = await addDefaultHeaders({
        path: '/public/static.js',
        response: {
          header: mockHeader
        }
      }, {
        continue: 'continue'
      })
      expect(result).toEqual('continue')
      expect(mockHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(mockHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    })
  })

  it('starts', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const { createServer, init } = await import('../server.js')
    const s = await createServer()
    await init(s)
    expect(s.info.port).toEqual(4000)
    await s.stop()
  })

  it('handles a request', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const { createServer, init } = await import('../server.js')
    const s = await createServer()
    await init(s)
    const r = await s.inject({
      method: 'GET',
      url: '/health'
    })
    expect(r.payload).toBe('healthy!')
    await s.stop()
  })

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 137]
  ])('shuts down on %s', (signal, code, done) => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    jest.spyOn(fs, 'mkdirSync').mockImplementation(jest.fn())
    import('../server.js').then(({ createServer, init }) => {
      createServer().then(s => {
        init(s).then(() => {
          s.events.on('stop', () => done())
          const serverStopSpy = jest
            .spyOn(s, 'stop')
            .mockImplementation(jest.fn())
          const processStopSpy = jest
            .spyOn(process, 'exit')
            .mockImplementation(jest.fn())
          process.exit = processStopSpy
          process.emit(signal)
          setImmediate(async () => {
            expect(serverStopSpy).toHaveBeenCalled()
            expect(processStopSpy).toHaveBeenCalledWith(code)
            jest.restoreAllMocks()
            done()
          })
        })
      })
    })
  })
})
