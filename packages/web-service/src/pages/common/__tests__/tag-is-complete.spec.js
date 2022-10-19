import { tagStatus } from '../../../services/api-requests.js'

describe('determining whether a flow is complete, or not', () => {
  it('tests whether we can determine `notComplete` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.notStarted)).toBe(false)
  })

  it('tests whether we can determine `inProgress` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.inProgress)).toBe(false)
  })

  it('tests whether we can determine `notStarted` is considered not complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.notStarted)).toBe(false)
  })

  it('tests whether an invalid state is considered complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete('confirmed')).toBe(false)
  })

  it('tests whether we can determine `complete` is considered complete', async () => {
    const { isComplete } = await import('../tag-is-complete.js')
    expect(isComplete(tagStatus.complete)).toBe(true)
  })
})
