import { applicationModel } from '../sdds-application-model'

describe('the applications model', () => {
  it('field functions are coorect', async () => {
    const sourceRemote = applicationModel.sdds_applications.targetFields.sdds_sourceremote.srcFunc()
    expect(sourceRemote).toBe(true)
  })
})
