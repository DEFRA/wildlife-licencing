import jp from 'jsonpath'

class UnrecoverableError extends Error {}

/*
 * Traverses the model and locates all the nodes starting
 * at the leaves and progressing towards the trunk. This is the order
 * that the entity operation ODATA queries will need to be run
 */
const nodeStepper = (node, entities = []) => {
  if (!entities.length) {
    entities.unshift(node.targetEntity)
  }

  Object.values(node.targetFields).forEach(e => {
    if (e.targetEntity) {
      entities.unshift(e.targetEntity)
      nodeStepper(e, entities)
    }
  })

  return entities
}

export const objectBuilder = (node, src) => {
  const x = Object.entries(node.targetFields).map(([name, value]) => {
    return value.srcJsonPath ? { [name]: jp.query(src, value.srcJsonPath)[0] } : objectBuilder(value, src)
  })

  console.log(x)
}

// TODO step in recursively for inline data
export const buildPayload = (node, src) => {
  try {
    const x = objectBuilder(node, src)

    const e = Object.entries(node.targetFields)
      .filter(f => f[1].srcJsonPath)
      .map(e => ({ name: e[0], srcJsonPath: e[1].srcJsonPath }))
    return e.reduce((a, c) => ({ ...a, [c.name]: jp.query(src, c.srcJsonPath)[0] }), {})
  } catch (error) {
    const msg = `Translation error for, node: \n${JSON.stringify(node, null, 4)} and data: \n${JSON.stringify(src, null, 4)}`
    console.error(msg, error)
    throw new UnrecoverableError(msg)
  }
}

export const formQuery = (model, src) => {
  const steps = nodeStepper(model)
  steps.forEach((s, idx) => {
    const node = steps.length === idx + 1
      ? jp.query(model, '$')
      : jp.query(model, `$..${s}`)

    const payLoad = buildPayload(node[0], src)
    console.log(payLoad)
  })
  console.log(steps)
}
