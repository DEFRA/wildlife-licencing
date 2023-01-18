
describe('The licence type class', () => {
  beforeEach(() => jest.resetModules())
  it('the tag functions', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => ({
            getAll: () => [{ tag: 'eligibility-check', tagState: 'complete' }]
          })
        }
      }
    }))
    const { A24 } = await import('../a24-badger-licence.js')
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: 'e8387a83-1165-42e6-afab-add01e77bc4c' })
      })
    }

    const csr = await A24.canShowReference(request)
    expect(csr).toBeTruthy()
    const prg = await A24.getProgress(request)
    expect(prg).toEqual({ complete: 1, from: 11 })
    const cs = await A24.canSubmit(request)
    expect(cs).toBeFalsy()
  })

  it('the A24 specific task functions', async () => {
    const tags = [{ tag: 'eligibility-check', tagState: 'complete' }]
    const { A24_SETTS_TASK } = await import('../a24-badger-licence.js')
    const csr = A24_SETTS_TASK.uri(tags)
    expect(csr).toEqual('/habitat-start')
    const enabled = A24_SETTS_TASK.enabled(tags)
    expect(enabled).toBeTruthy()
    const status = A24_SETTS_TASK.status(tags)
    expect(status).toEqual('not-started')
  })
})
