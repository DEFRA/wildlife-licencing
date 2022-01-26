import { powerAppsObjectBuilder, localObjectBuilder } from '../transformer.js'
import { tasks, srcData, tgtData, tgtKeys } from '../../test-model-data/task-model.js'

describe('The model transformer', () => {
  it('correctly transforms from the source to the target schema for a given node', async () => {
    const t = await powerAppsObjectBuilder(tasks.targetFields, srcData)
    expect(t).toEqual({
      subject: 'Get all things done',
      'refdata@odata.bind': '/refdata(123)',
      'boundRelation@odata.bind': '/bound-relation(123456)'
    })
  })

  it('correctly transforms from the source to the target schema for a given node where a srcFunc is set', async () => {
    const t = await powerAppsObjectBuilder(tasks.relationships.contact.targetFields, srcData)
    expect(t).toEqual({ fullname: 'Brian Jones' })
  })

  it('omits field if neither srcPath or srcFunc are set transforming from the source to the target schema', async () => {
    const t = await powerAppsObjectBuilder(tasks.relationships.taskType.targetFields, srcData)
    expect(t).toEqual({ description: 'dependency' })
  })

  it('correctly transforms from the target to the source schema', async () => {
    const s = await localObjectBuilder({ tasks }, tgtData)
    expect(s.data).toEqual(srcData)
    expect(s.keys).toEqual(tgtKeys)
  })

  it('returns a null if a required field is not set', async () => {
    const t2 = Object.assign(tasks)
    t2.targetFields.refdata2.required = true
    const s = await localObjectBuilder({ t2 }, tgtData)
    expect(s).toBeNull()
  })

  it('throws if error on transformation from the target to the source schema if supplied null', async () => {
    await expect(async () => await localObjectBuilder({ tasks }, null)).rejects.toThrow()
  })
})
