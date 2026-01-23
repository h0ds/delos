import { createServer } from 'http'
import { config } from './config.js'

const httpServer = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`)
  res.writeHead(200)
  res.end('OK')
})

httpServer.listen(config.port, () => {
  console.log(`[server] minimal server running on port ${config.port}`)
})
