import { compileTemplate } from '../../../../initialise-snapshot-tests'
import path from 'path'

describe('applicant phone number page', () => {
  beforeEach(() => jest.resetModules())

  describe('applicant phone number page template', () => {
    it('Matches the snapshot when accountName provided', async () => {
      const template = await compileTemplate(path.join(__dirname, '../licence-holder-phone-number.njk'))

      const renderedHtml = template.render({
        data: {
          accountName: 'Acme Ltd',
          contactName: 'John Smith'
        }
      })

      expect(renderedHtml).toMatchSnapshot()
    })

    it('Matches the snapshot when accountName not provided', async () => {
      const template = await compileTemplate(path.join(__dirname, '../licence-holder-phone-number.njk'))

      const renderedHtml = template.render({
        data: {
          contactName: 'John Smith'
        }
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })
})
