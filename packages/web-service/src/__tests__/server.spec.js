import { createServer, init, addDefaultHeaders } from '../server'

describe('the WEB server', () => {
  describe('the default header function', () => {
    it('adds a correct set of response headers - not static', async () => {
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

  it('starts', done => {
    createServer().then(s => {
      init(s).then(() => {
        expect(s.info.port).toEqual(4000)
        s.events.on('stop', () => done())
        s.stop()
      })
    })
  })

  it('handles a request', done => {
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        s.inject({
          method: 'GET',
          url: '/hello'
        })
          .then(r => {
            expect(r).toBe('Hello World!')
            s.stop()
          })
          .catch(e => {
            console.log(e)
            s.stop()
          })
      })
    })
  })

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 137]
  ])('shuts down on %s', (signal, code, done) => {
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
