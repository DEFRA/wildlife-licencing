import { compileTemplate } from '../../../initialise-snapshot-tests.js'
import path from 'path'
describe('The user-role', () => {
  beforeEach(() => jest.resetModules())
  it('setData works as expected', async () => {
    const { setData } = await import('../user-role.js')
    const mockSetData = jest.fn()
    const request = {
      payload: { 'user-role': 'a role' },
      cache: () => ({
        getData: () => ({}),
        setData: mockSetData
      })
    }
    await setData(request)
    expect(mockSetData).toHaveBeenCalledWith({ applicationRole: 'a role' })
  })


    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../user-role.njk'))
      const renderedHtml = template.render({ data: {} })
      expect(renderedHtml).toMatchSnapshot()
  })
})
