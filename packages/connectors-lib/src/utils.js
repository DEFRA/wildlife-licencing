const endProcess = err => {
  console.error('Unexpected error, terminating:', err)
  process.exit(-1)
}

export { endProcess }
