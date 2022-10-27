import { tagStatus } from '../../../services/api-requests.js'

describe('determining whether a flow is complete, or not', () => {
  it('tests whether we can determine `cannot-start` is considered not complete', async () => {
    const { isCompleteOrConfirmed } = await import('../tag-is-complete-or-confirmed.js')
    expect(isCompleteOrConfirmed(tagStatus.CANNOT_START)).toBe(false)
  })

  it('tests whether we can determine `not-started` is considered not complete', async () => {
    const { isCompleteOrConfirmed } = await import('../tag-is-complete-or-confirmed.js')
    expect(isCompleteOrConfirmed(tagStatus.NOT_STARTED)).toBe(false)
  })

  it('tests whether we can determine `in-progress` is considered not complete', async () => {
    const { isCompleteOrConfirmed } = await import('../tag-is-complete-or-confirmed.js')
    expect(isCompleteOrConfirmed(tagStatus.IN_PROGRESS)).toBe(false)
  })

  it('tests whether we can determine `complete-not-confirmed` is considered complete', async () => {
    const { isCompleteOrConfirmed } = await import('../tag-is-complete-or-confirmed.js')
    expect(isCompleteOrConfirmed(tagStatus.COMPLETE_NOT_CONFIRMED)).toBe(true)
  })

  it('tests whether we can determine `complete` is considered complete', async () => {
    const { isCompleteOrConfirmed } = await import('../tag-is-complete-or-confirmed.js')
    expect(isCompleteOrConfirmed(tagStatus.COMPLETE)).toBe(true)
  })
})
