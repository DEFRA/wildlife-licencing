import Joi from 'joi'

export const gridReferenceValidRegex = /^(H[OPTUW-Z]|N[A-HJ-PR-UW-Z]|OV|S[C-EHJKM-PR-Y]|T[AFGLMQR])\d{6}$/i
export const gridReferenceFormatRegex = /^[a-zA-Z]{2}\d{6}$/

export const gridReferenceValidator = async (payload, gridReferenceLabel) => {
  if (!payload[gridReferenceLabel]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: You have not entered a grid reference',
      path: [gridReferenceLabel],
      type: 'no-grid-reference',
      context: {
        label: gridReferenceLabel,
        value: 'Error',
        key: gridReferenceLabel
      }
    }], null)
  }

  if (payload[gridReferenceLabel] && !payload[gridReferenceLabel].match(gridReferenceFormatRegex)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The grid reference you have entered is not in the right format',
      path: [gridReferenceLabel],
      type: 'grid-reference-wrong-format',
      context: {
        label: gridReferenceLabel,
        value: 'Error',
        key: gridReferenceLabel
      }
    }], null)
  }

  if (payload[gridReferenceLabel] && !payload[gridReferenceLabel].match(gridReferenceValidRegex)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The reference you have entered is not an existing grid reference',
      path: [gridReferenceLabel],
      type: 'grid-reference-do-not-exist',
      context: {
        label: gridReferenceLabel,
        value: 'Error',
        key: gridReferenceLabel
      }
    }], null)
  }
}
