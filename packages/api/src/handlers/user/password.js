import argon2 from 'argon2'

export const toHash = async plaintext =>
  argon2.hash(plaintext, { type: argon2.argon2id })
export const verify = async (plaintext, hash) => argon2.verify(hash, plaintext)
