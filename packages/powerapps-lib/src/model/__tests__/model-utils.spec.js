import { buildRequestPath, findRequestSequence } from '../../model/model-utils'
import { tasks, requestPath } from '../../test-model-data/task-model.js'
// For the test use the example of the multilevel expansion shown here
// https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/retrieve-related-entities-query
// Basically tasks->contact->account->user
// The foo-bar section is added because the nested and listing delimiters differ, ';' and ',' respectively

describe('The model utilities;', () => {
  it('The request path builds correctly from the model', () => {
    expect(buildRequestPath({ tasks })).toBe(requestPath)
  })

  it('The sequence correctly from the model', () => {
    expect(findRequestSequence({ tasks })).toEqual(['systemUser', 'account', 'contact', 'taskType', 'tasks'])
  })
})
