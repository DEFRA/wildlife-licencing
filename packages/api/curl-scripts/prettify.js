let body = ''

process.stdin.on('data', chunk => {
  body += chunk
  const obj = JSON.parse(chunk)
  console.log(JSON.stringify(obj, null, 4))
})

process.stdin.on('end', () => {
  const obj = JSON.parse(body)
  console.log(JSON.stringify(obj, null, 4))
})
