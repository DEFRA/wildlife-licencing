import { Nunjucks, environment } from '../../../initialise-snapshot-tests'
import { readFile } from 'fs/promises'
import path from 'path'
describe('application-licence page template', () => {
  it('Matches the snapshot', async () => {
    const source = await readFile(path.join(__dirname, '../application-licence-summary.njk'), { encoding: 'utf8' })
    const template = Nunjucks.compile(source, environment)

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
