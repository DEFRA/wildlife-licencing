import { createModels, models } from '../sequelize-model.js'
import { describe } from 'jest-circus'

jest.mock('@defra/wls-connectors-lib')

describe('The sequential model', () => {
  it('Creates the model', async () => {
    const { SEQUELIZE } = await import('@defra/wls-connectors-lib')
    const mockDefine = jest.fn(() => ({ sync: () => jest.fn() }))
    const mockQuery = jest.fn()
    SEQUELIZE.getSequelize = jest.fn(() => ({
      define: mockDefine,
      query: mockQuery
    }))
    await createModels()
    expect(mockDefine).toHaveBeenCalledWith('user', expect.any(Object), expect.any(Object))
    expect(mockDefine).toHaveBeenCalledWith('applications', expect.any(Object), expect.any(Object))
    expect(mockDefine).toHaveBeenCalledWith('sites', expect.any(Object), expect.any(Object))
    expect(mockDefine).toHaveBeenCalledWith('application-sites', expect.any(Object), expect.any(Object))
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('application_ref_seq'))
    expect(models.users).toBeTruthy()
    expect(models.applications).toBeTruthy()
    expect(models.sites).toBeTruthy()
    expect(models.applicationSites).toBeTruthy()
    expect(models.getApplicationRef).toBeTruthy()
  })
})
