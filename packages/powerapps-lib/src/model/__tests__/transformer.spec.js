import { powerAppsObjectBuilder, localObjectBuilder } from '../transformer.js'
import { tasks, srcData, tgtData, tgtKeys } from '../../test-model-data/task-model.js'

describe('The model transformer', () => {
  it('correctly transforms from the source to the target schema for a given node', () => {
    const t = powerAppsObjectBuilder(tasks.targetFields, srcData)
    expect(t).toEqual({ subject: 'Get all things done', 'refdata@odata.bind': '/refdata(123)' })
  })

  it('correctly transforms from the source to the target schema for a given node where a srcFunc is set', () => {
    const t = powerAppsObjectBuilder(tasks.relationships.contact.targetFields, srcData)
    expect(t).toEqual({ fullname: 'Brian Jones' })
  })

  it('omits field if neither srcPath or srcFunc are set transforming from the source to the target schema', () => {
    const t = powerAppsObjectBuilder(tasks.relationships.taskType.targetFields, srcData)
    expect(t).toEqual({ description: 'dependency' })
  })

  it('correctly transforms from the target to the source schema', () => {
    const s = localObjectBuilder({ tasks }, tgtData)
    expect(s.data).toEqual(srcData)
    expect(s.keys).toEqual(tgtKeys)
  })

  it('throws if error on transformation from the target to the source schema', () => {
    expect(() => localObjectBuilder({ tasks }, { foo: 'bar' }))
      .toThrow()
  })

  it('throws if error on transformation from the target to the source schema if supplied null', () => {
    expect(() => localObjectBuilder({ tasks }, null))
      .toThrow()
  })
})
