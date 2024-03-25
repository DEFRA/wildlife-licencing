import { compileTemplate } from '../../../initialise-snapshot-tests'
import path from 'path'

describe('email confirmation page', () => {
  beforeEach(() => jest.resetModules())

  describe('email confirmation page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../email-confirmation.njk'))

      const renderedHtml = template.render({})

      expect(renderedHtml).toMatchSnapshot()
    })
  })
})
