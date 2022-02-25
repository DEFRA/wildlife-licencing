describe('The generic power-apps read stream provider', () => {
  beforeEach(() => jest.resetModules())

  it('returns readable stream of single JSON objects and handles paging', done => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async p => {
          if (p === '/more/data') {
            return Promise.resolve({
              value: [{ a: 1 }, { a: 2 }]
            })
          } else {
            return Promise.resolve({
              '@odata.nextLink': '/more/data',
              value: [{ a: 4 }, { a: 5 }, { a: 6 }]
            })
          }
        },
        getClientUrl: () => 'base'
      }
    }))

    import('../powerapps-read-stream.js').then(({ powerAppsReadStream }) => {
      const stream = powerAppsReadStream('base/path', s => s)

      let cnt = 0
      stream.on('data', c => {
        expect(Object.keys(c)[0]).toEqual('a')
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(5)
        done()
      })
    })
  })
})
