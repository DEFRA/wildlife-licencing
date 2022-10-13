import Joi from 'joi'
import { cacheDirect } from '../../session-cache/cache-decorator.js'

export const maxInputValidator = async (payload, context, key) => {
  // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
  // Which leads to a mismatch on the character count as
  // '\r\n'.length == 2
  // '\n'.length   == 1
  const input = payload[key].replaceAll('\r\n', '\n')
  const journeyData = await cacheDirect(context).getData()

  if (input === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no text entered',
      path: [key],
      type: 'string.empty',
      context: {
        label: key,
        value: 'Error',
        key: key
      }
    }], null)
  }

  if (input.length > 4000) {
    // Store the text in the input, so the user won't lose everything they typed, we'll delete it in getData()
    await cacheDirect(context).setData(Object.assign(journeyData, { tempInput: input }))
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: max text input exceeded',
      path: [key],
      type: 'string.max',
      context: {
        label: key,
        value: 'Error',
        key: key
      }
    }], null)
  }
}
