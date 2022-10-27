import { tagStatus } from '../../../services/api-requests.js'

describe('determining whether a flow is complete, or not', () => {
  it('tests whether we can determine `cannot-start` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.CANNOT_START)).toBe(false)
  })

  it('tests whether we can determine `not-started` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.NOT_STARTED)).toBe(false)
  })

  it('tests whether we can determine `in-progress` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.IN_PROGRESS)).toBe(false)
  })

  it('tests whether we can determine `complete` is considered complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.COMPLETE)).toBe(true)
  })
})
