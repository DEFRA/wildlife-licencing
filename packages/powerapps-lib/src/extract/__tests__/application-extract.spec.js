import { tasks, srcData, tgtData } from '../../test-model-data/task-model.js'

describe('The application extract job', () => {
  beforeEach(() => jest.resetModules())

  it('returns readable stream of single JSON objects and handles paging', done => {
    // There is a bug in jest - it does not run the mock correctly in the async generator.
    // Hence these tests are a bit kludged; I have to assign fetch to a function, not a jest mock
    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async p => {
          if (p === '/more/data') {
            return Promise.resolve({
              value: [tgtData, tgtData]
            })
          } else {
            return Promise.resolve({
              '@odata.nextLink': '/more/data',
              value: [tgtData, tgtData, tgtData]
            })
          }
        },
        getClientUrl: () => 'base'
      }
    }))

    import('../powerapps-read-stream.js').then(({ extractAndTransform }) => {
      const stream = extractAndTransform({ tasks })
      let cnt = 0
      stream.on('data', c => {
        expect(c.data).toEqual(srcData)
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(5)
        done()
      })
    })
  })

  it('does not disrupt the stream and ignores object when transformation throws an error', done => {
    // eslint-disable-next-line camelcase
    const tgtRemoveExpected = (({ subject, ...t }) => t)(tgtData)

    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async p => {
          if (p === '/more/data') {
            return Promise.resolve({
              value: [tgtData, tgtRemoveExpected]
            })
          } else {
            return Promise.resolve({
              '@odata.nextLink': '/more/data',
              value: [tgtRemoveExpected, tgtData, tgtData]
            })
          }
        },
        getClientUrl: () => 'base'
      }
    }))

    import('../powerapps-read-stream.js').then(({ extractAndTransform }) => {
      const stream = extractAndTransform({ tasks })
      let cnt = 0
      stream.on('data', c => {
        expect(c.data).toEqual(srcData)
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(3)
        done()
      })
    })
  })

  it('returns readable stream of option set data', done => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async () => Promise.resolve({
          value: [{
            Name: 'os',
            Options: [
              {
                Value: 100000000,
                Label: {
                  UserLocalizedLabel: { Label: 'Agriculture' }
                }
              }
            ]
          }]
        })
      }
    }))

    import('../powerapps-read-stream.js').then(({ extractAndTransformGlobalOptionSetDefinitions }) => {
      const stream = extractAndTransformGlobalOptionSetDefinitions()
      let cnt = 0
      stream.on('data', c => {
        expect(c).toEqual({
          name: 'os',
          values: [
            {
              value: 100000000,
              description: 'Agriculture'
            }
          ]
        })
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(1)
        done()
      })
    })
  })

  it('returns readable stream of option set data and does not disrupt the stream with bad data', done => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async () => Promise.resolve({
          value: [{
            Name: 'os',
            Options: [
              {
                Value: 100000000,
                Label: {
                  UserLocalizedLabel: { Label: 'Agriculture' }
                }
              }
            ]
          }, {
            Name: 'bad',
            Options: [
              {
                Value: 100000000,
                Label: {
                  UserLocalizedLabel: {}
                }
              }
            ]
          }]
        })
      }
    }))

    import('../powerapps-read-stream.js').then(({ extractAndTransformGlobalOptionSetDefinitions }) => {
      const stream = extractAndTransformGlobalOptionSetDefinitions()
      let cnt = 0
      stream.on('data', c => {
        expect(c).toEqual({
          name: 'os',
          values: [
            {
              value: 100000000,
              description: 'Agriculture'
            }
          ]
        })
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(1)
        done()
      })
    })
  })
})
