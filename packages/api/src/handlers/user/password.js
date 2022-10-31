import argon2 from 'argon2'

export const toHash = async plaintext => {
  try {
    return argon2.hash(plaintext, {
      type: argon2.argon2id
    })
  } catch (err) {
    console.error(err)
    return false
  }
}

export const verify = async (plaintext, hash) => {
  try {
    return argon2.verify(hash, plaintext)
  } catch (err) {
    console.error(err)
    return false
  }
}
