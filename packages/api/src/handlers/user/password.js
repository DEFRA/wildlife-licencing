import argon2 from 'argon2'

export const toHash = async plaintext => {
  try {
    return argon2.hash(plaintext, {
      type: argon2.argon2id
    })
  } catch (err) {
    console.error(err)
  }
}

export const verify = async (plaintext, hash) => {
  try {
    const result = await argon2.verify(hash, plaintext)
    return result
  } catch (err) {
    console.error(err)
    return false
  }
}
