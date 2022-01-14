import tgtJson from '../../model/test-data/json-tgt.js'
import srcJson from '../../model/test-data/json-src.js'

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
              value: [tgtJson, tgtJson]
            })
          } else {
            return Promise.resolve({
              '@odata.nextLink': '/more/data',
              value: [tgtJson, tgtJson, tgtJson]
            })
          }
        },
        getClientUrl: () => 'base'
      }
    }))

    import('../application-extract.js').then(({ extractApplications }) => {
      const stream = extractApplications()
      let cnt = 0
      stream.on('data', c => {
        expect(c.data).toEqual(srcJson)
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
    const tgtRemoveExpected = (({ sdds_detailsofconvictions, ...t }) => t)(tgtJson)

    jest.doMock('@defra/wls-connectors-lib', () => ({
      POWERAPPS: {
        fetch: async p => {
          if (p === '/more/data') {
            return Promise.resolve({
              value: [tgtJson, tgtRemoveExpected]
            })
          } else {
            return Promise.resolve({
              '@odata.nextLink': '/more/data',
              value: [tgtRemoveExpected, tgtJson, tgtJson]
            })
          }
        },
        getClientUrl: () => 'base'
      }
    }))

    import('../application-extract.js').then(({ extractApplications }) => {
      const stream = extractApplications()
      let cnt = 0
      stream.on('data', c => {
        expect(c.data).toEqual(srcJson)
        cnt++
      })

      stream.on('end', () => {
        expect(cnt).toBe(3)
        done()
      })
    })
  })
})
