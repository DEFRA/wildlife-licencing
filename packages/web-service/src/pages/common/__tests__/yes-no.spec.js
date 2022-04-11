import { isYes } from '../yes-no.js'

describe('the generic yes-no page', () => {
  it('test the isYes helper', async () => {
    expect(isYes({ payload: { 'yes-no': 'yes' } })).toBeTruthy()
    expect(isYes({ payload: { 'yes-no': 'no' } })).not.toBeTruthy()
  })
})
