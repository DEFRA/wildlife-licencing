/* eslint-disable camelcase */
import { formQuery, objectBuilder } from '../query-formation.js'

const src = {
  field1: 'level0 field1',
  field2: 'level0 field2',
  level1: {
    field3: 'level1a field3',
    field4: 'level1a field4',
    level3: {
      field8: 'level3a field8'
    },
    field7: 'level2a field7'
  },
  level1b: {
    field5: 'level1b field5',
    field6: 'level1b field6',
    level2b: {
      field8: 'level2b'
    }
  }
}

const model = {
  targetEntity: 'level0',
  targetKey: 'level0id',
  targetFields: {
    field1: { srcJsonPath: '$.field1' },
    field2: { srcJsonPath: '$.field2' },
    level1a: {
      targetEntity: 'level1a',
      targetKey: 'level1aid',
      targetFields: {
        field3: { srcJsonPath: '$.level1.field3' },
        field4: { srcJsonPath: '$.level1.field4' },
        inline: {
          field9: { srcJsonPath: '$.level1.field3' },
          field10: { srcJsonPath: '$.level1.field3' }
        },
        level2a: {
          targetEntity: 'level2a',
          targetKey: 'level2aid',
          targetFields: {
            field7: { srcJsonPath: '$.level1.field7' },
            level3a: {
              targetEntity: 'level3a',
              targetKey: 'level3aid',
              targetFields: {
                field8: { srcJsonPath: '$.level1.level3.field8' }
              }
            }
          }
        }
      }
    },
    level1b: {
      targetEntity: 'level1b',
      targetKey: 'level1bid',
      targetFields: {
        field5: {
          srcJsonPath: '$.level1b.field5'
        },
        field6: {
          srcJsonPath: '$.level1b.field6'
        }
      }
    }
  }
}

describe('Query formation', () => {
  it('forms a batch query set', () => {
    objectBuilder(model.targetFields.level1a, src)
    // const result = formQuery(model, src)
  })
})
