import { compileTemplate } from '../../../initialise-snapshot-tests'
import path from 'path'

describe('application-licence page template', () => {
  it('Matches the snapshot', async () => {
    const template = await compileTemplate(path.join(__dirname, '../application-licence-summary.njk'))

    const data = {
      application: 'Text',
      applicant: 'Text',
      licenceStatuses: [],
      applicationLicence: 'Text',
      lastSentEventFlag: 'Text',
      lastLicenceReturn: 'Text'
    }

    const renderedHtml = template.render(data)

    expect(renderedHtml).toMatchSnapshot()
  })
})
