import { applicationModel } from '../model/sdds-application-model.js'

describe('Application batch update', () => {
  it('correctly calls batch update', async () => {
    const mockBatchUpdate = jest.fn()
    jest.doMock('../../batch-update/batch-update.js', () => ({
      batchUpdate: mockBatchUpdate
    }))
    const { applicationUpdate } = await import('../application-update.js')
    await applicationUpdate({ a: 'a' }, { b: 'b' })
    expect(mockBatchUpdate).toHaveBeenCalledWith({ a: 'a' }, { b: 'b' }, applicationModel)
  })
})
